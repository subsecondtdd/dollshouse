import * as assert from "assert"
import express from "express"
import expressSession, { MemoryStore, Store } from "express-session"
import asyncHandler from "express-async-handler"
import nanoid from 'nanoid'
import { serialize } from "cookie"
import signature from "cookie-signature"
import nodeFetch from "node-fetch"
// @ts-ignore
import fetchCookie from "fetch-cookie"
import { promisify } from "util"
import { AddressInfo } from "net"
import http from "http"
import bodyParser = require("body-parser")

class Character<UserAgent, UserInfo> {
  private userAgent: UserAgent
  private _userInfo: UserInfo

  constructor(private readonly name: string, private readonly makeUserAgent: (userInfo: UserInfo) => UserAgent) {
  }

  set userInfo(userInfo: UserInfo) {
    this._userInfo = userInfo
  }

  async attemptsTo(action: (userAgent: UserAgent) => Promise<UserAgent>) {
    if (!this.userAgent) {
      this.userAgent = this.makeUserAgent(this._userInfo)
    }
    this.userAgent = await action(this.userAgent)
  }
}

interface DollshouseOptions<DomainApi, UserAgent, UserInfo> {
  makeDomainApi: () => DomainApi,
  makeDomainUserAgent: (domainApi: DomainApi, userInfo: UserInfo) => UserAgent
  makeHttpUserAgent: (baseUrl: string, cookie: string) => UserAgent
  makeHttpServer: (domainApi: DomainApi, sessionCookieName: string, sessionStore: Store | MemoryStore, sessionSecret: string) => Promise<http.Server>
  sessionCookieName: string,
  makeSessionStore: () => Store | MemoryStore
  sessionSecret: string
}

interface DollshouseConstructor<UserAgent, UserInfo> {
  new(isHttp: boolean): Dollshouse<UserAgent, UserInfo>

  readonly prototype: Dollshouse<UserAgent, UserInfo>
}

interface Dollshouse<UserAgent, UserInfo> {
  start(): Promise<void>

  stop(): Promise<void>

  getCharacter(characterName: string): Promise<Character<UserAgent, UserInfo>>
}

function dollshouse<DomainApi, UserAgent, UserInfo>(options: DollshouseOptions<DomainApi, UserAgent, UserInfo>): DollshouseConstructor<UserAgent, UserInfo> {
  class DollshouseImpl implements Dollshouse<UserAgent, UserInfo> {
    private readonly characters = new Map<string, Character<UserAgent, UserInfo>>()
    private readonly stoppables: Array<() => void> = []

    private domainApi: DomainApi
    private baseUrl: string
    private sessionStore: Store | MemoryStore

    constructor(private readonly isHttp: boolean) {
    }

    async start() {
      this.domainApi = options.makeDomainApi()

      if (this.isHttp) {
        this.sessionStore = options.makeSessionStore()
        const server = await options.makeHttpServer(this.domainApi, options.sessionCookieName, this.sessionStore, options.sessionSecret)
        const listen = promisify(server.listen.bind(server))
        await listen()
        this.stoppables.push(async () => {
          const close = promisify(server.close.bind(server))
          await close()
        })
        const addr = server.address() as AddressInfo
        const port = addr.port
        this.baseUrl = `http://localhost:${port}`
      }
    }

    async stop() {
      for (const stoppable of this.stoppables.reverse()) {
        await stoppable()
      }
    }

    async getCharacter(characterName: string): Promise<Character<UserAgent, UserInfo>> {
      if (this.characters.has(characterName)) return this.characters.get(characterName)

      const makeUserAgent = (userInfo: UserInfo): UserAgent => {
        if (this.isHttp) {
          const cookie = {
            originalMaxAge: 1000,
            maxAge: 1000,
            path: "/",
            httpOnly: true,
            expires: false,
          }
          const session = {
            userInfo,
            cookie
          }

          const sessionId = nanoid()
          this.sessionStore.set(sessionId, session)

          // See express-session setcookie/getcookie
          const signed = 's:' + signature.sign(sessionId, options.sessionSecret)
          const clientCookie = serialize(options.sessionCookieName, signed)
          return options.makeHttpUserAgent(this.baseUrl, clientCookie)
        } else {
          return options.makeDomainUserAgent(this.domainApi, userInfo)
        }
      }

      const character = new Character(characterName, makeUserAgent)
      this.characters.set(characterName, character)
      return character
    }
  }

  return DollshouseImpl
}

interface TestUserAgent {
  createProject(projectName: string): Promise<TestUserAgent>
}

class TestDomainUserAgent implements TestUserAgent {
  constructor(private readonly domainApi: TestDomainApi, private readonly userInfo: TestUserInfo) {
  }

  async createProject(projectName: string) {
    await this.domainApi.createProject(this.userInfo, projectName)
    return this
  }
}

class TestHttpUserAgent implements TestUserAgent {
  constructor(private readonly baseUrl: string, private readonly cookie: string, private readonly fetcher: GlobalFetch) {
  }

  async createProject(projectName: string) {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    }
    if (this.cookie) {
      headers["Cookie"] = this.cookie
    }

    const res = await this.fetcher.fetch(`${this.baseUrl}/projects`, {
      method: "POST",
      body: JSON.stringify({
        projectName
      }),
      headers
    })
    if (!res.ok) {
      const errorMessage = await res.text()
      throw new Error(errorMessage)
    }
    return this
  }
}

interface TestUserInfo {

}

class TestDomainApi {
  messages: Array<{ userInfo: TestUserInfo, projectName: string }> = []

  createProject(userInfo: TestUserInfo, projectName: string) {
    this.messages.push({userInfo, projectName})
  }
}

describe('dollshouse', () => {
  let TestHouse: DollshouseConstructor<TestUserAgent, TestUserInfo>
  let house: Dollshouse<TestUserAgent, TestUserInfo>
  let testDomainApi: TestDomainApi

  beforeEach(async () => {
    testDomainApi = new TestDomainApi()

    const options: DollshouseOptions<TestDomainApi, TestUserAgent, TestUserInfo> = {
      makeDomainApi: () => testDomainApi,
      makeDomainUserAgent: (domainApi: TestDomainApi, userInfo: TestUserInfo) => new TestDomainUserAgent(domainApi, userInfo),
      makeHttpUserAgent: (baseUrl: string, cookie: string) => new TestHttpUserAgent(baseUrl, cookie, {fetch: fetchCookie(nodeFetch)}),
      makeHttpServer: async (domainApi: TestDomainApi, sessionCookieName: string, sessionStore: MemoryStore, sessionSecret: string) => {
        const app = express()
        app.use(expressSession({
          name: sessionCookieName,
          secret: sessionSecret,
          store: sessionStore,
          resave: true,
          saveUninitialized: true,
        }))
        app.use(bodyParser.json())
        app.post("/projects", asyncHandler(async (req, res) => {
          const {projectName} = req.body
          const userInfo: TestUserInfo = req.session.userInfo
          const userAgent = new TestDomainUserAgent(domainApi, userInfo)
          await userAgent.createProject(projectName)
          res.end()
        }))
        return http.createServer(app)
      },
      sessionCookieName: 'session-id',
      makeSessionStore(): MemoryStore {
        return new MemoryStore()
      },
      sessionSecret: 'keyboard cat'
    }
    TestHouse = dollshouse(options)
  })

  afterEach(async () => {
    await house.stop()
  })

  const configs = [true, false]
  configs.forEach((isHttp: boolean) => {
    const name = isHttp ? 'http-domain' : 'domain'
    it(`runs through ${name}`, async () => {
      house = new TestHouse(isHttp)
      await house.start()
      const aslak = await house.getCharacter('aslak')
      aslak.userInfo = {userId: 'id-aslak-123'}
      await aslak.attemptsTo(async (userAgent: TestUserAgent): Promise<TestUserAgent> => {
        await userAgent.createProject('Test Project')
        return userAgent
      })

      assert.deepStrictEqual(testDomainApi.messages[0], {
        userInfo: {userId: 'id-aslak-123'},
        projectName: 'Test Project'
      })
    })

  })
})
