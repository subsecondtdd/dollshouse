import * as assert from "assert"
import express from "express"
import nodeFetch from "node-fetch"
// @ts-ignore
import fetchCookie from "fetch-cookie"
import { promisify } from "util"
import { AddressInfo } from "net"
import http from "http"

class Character<UserAgent, UserInfo> {
  private userAgent: UserAgent
  private userInfo: UserInfo

  constructor(private readonly name: string, private readonly makeUserAgent: (userInfo: UserInfo) => UserAgent) {

  }

  async attemptsTo(action: (userAgent: UserAgent) => Promise<UserAgent>) {
    if (!this.userAgent) {
      this.userAgent = this.makeUserAgent(this.userInfo)
    }
    this.userAgent = await action(this.userAgent)
  }
}

interface DollshouseOptions<DomainApi, UserAgent, UserInfo> {
  makeDomainApi: () => DomainApi,
  makeDomainUserAgent: (domainApi: DomainApi, userInfo: UserInfo) => UserAgent
  makeHttpUserAgent: (baseUrl: string) => UserAgent
  makeHttpServer: (domainApi: DomainApi) => Promise<http.Server>
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

    constructor(private readonly isHttp: boolean) {
    }

    async start() {
      this.domainApi = options.makeDomainApi()

      if (this.isHttp) {
        const server = await options.makeHttpServer(this.domainApi)
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
          return options.makeHttpUserAgent(this.baseUrl)
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
  constructor(private readonly baseUrl: string, private readonly fetcher: GlobalFetch) {
  }

  async createProject(projectName: string) {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
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
  it('runs through domain user agent', async () => {
    const testDomainApi = new TestDomainApi()
    const options: DollshouseOptions<TestDomainApi, TestUserAgent, TestUserInfo> = {
      makeDomainApi: () => testDomainApi,
      makeDomainUserAgent: (domainApi: TestDomainApi, userInfo: TestUserInfo) => new TestDomainUserAgent(domainApi, userInfo),
      makeHttpUserAgent: (baseUrl: string) => {
        throw new Error("Unexpected")
      },
      makeHttpServer: (domainApi: TestDomainApi) => {
        throw new Error("Unexpected")
      }
    }
    const TestHouse = dollshouse(options)
    const house = new TestHouse(false)
    await house.start()

    const aslak = await house.getCharacter('aslak')
    await aslak.attemptsTo(async (userAgent: TestUserAgent): Promise<TestUserAgent> => {
      await userAgent.createProject('Test Project')
      return userAgent
    })

    assert.deepStrictEqual(testDomainApi.messages[0], {userInfo: undefined, projectName: 'Test Project'})
  })

  it('runs through http user agent', async () => {
    const testDomainApi = new TestDomainApi()

    const options: DollshouseOptions<TestDomainApi, TestUserAgent, TestUserInfo> = {
      makeDomainApi: () => testDomainApi,
      makeDomainUserAgent: (domainApi: TestDomainApi, userInfo: TestUserInfo) => new TestDomainUserAgent(domainApi, userInfo),
      makeHttpUserAgent: (baseUrl: string) => new TestHttpUserAgent(baseUrl, {fetch: fetchCookie(nodeFetch)}),
      makeHttpServer: async (domainApi: TestDomainApi) => {
        const app = express()
        return http.createServer(app)
      }
    }
    const TestHouse = dollshouse(options)
    const house = new TestHouse(true)
    await house.start()

    const aslak = await house.getCharacter('aslak')
    await aslak.attemptsTo(async (userAgent: TestUserAgent): Promise<TestUserAgent> => {
      await userAgent.createProject('Test Project')
      return userAgent
    })

    assert.deepStrictEqual(testDomainApi.messages[0], {userInfo: undefined, projectName: 'Test Project'})
  })
})
