import * as assert from "assert"
import express from "express"
import expressSession, { MemoryStore } from "express-session"
import asyncHandler from "express-async-handler"
import nodeFetch from "node-fetch"
// @ts-ignore
import fetchCookie from "fetch-cookie"
import http from "http"
import dollshouse, { Dollshouse, DollshouseConstructor, DollshouseOptions } from "../src/Dollshouse"
import bodyParser = require("body-parser")
import TestUserAgent from "./TestUserAgent"
import TestUserInfo from "./TestUserInfo"
import TestDomainUserAgent from "./TestDomainUserAgent"
import DomTestUserAgent from "./DomTestUserAgent"
import TestDomainApi from "./TestDomainApi"

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

describe('dollshouse', () => {
  let TestHouse: DollshouseConstructor<TestUserInfo, TestUserAgent>
  let house: Dollshouse<TestUserInfo, TestUserAgent>
  let testDomainApi: TestDomainApi

  beforeEach(async () => {
    testDomainApi = new TestDomainApi()

    const options: DollshouseOptions<TestDomainApi, TestUserInfo, TestUserAgent> = {
      makeDomainApi: () => testDomainApi,
      makeDomainUserAgent: (domainApi: TestDomainApi, userInfo: TestUserInfo) => new TestDomainUserAgent(domainApi, userInfo),
      makeHttpUserAgent: (baseUrl: string, cookie: string) => new TestHttpUserAgent(baseUrl, cookie, {fetch: fetchCookie(nodeFetch)}),
      makeDomUserAgent: ($characterNode: HTMLElement, userAgent: TestUserAgent) => new DomTestUserAgent($characterNode, userAgent),
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

  //                   dom   http
  // dom-http-domain    t      t
  // dom-domain         t      f
  // http-domain        f      t
  // domain             f      f
  const domConfig = [false, true]
  domConfig.forEach((isDom: boolean) => {
    const httpConfig = [false, true]
    httpConfig.forEach((isHttp: boolean) => {
      const nameParts = []
      if(isDom) {nameParts.push('dom')}
      if(isHttp) {nameParts.push('http')}
      {nameParts.push('domain')}
      const name = nameParts.join('-')

      it(`runs through ${name}`, async () => {
        house = new TestHouse(isDom, isHttp)
        await house.start()
        const aslak = await house.getCharacter('aslak')
        const userInfo: TestUserInfo = {userId: 'id-aslak-123'}
        aslak.userInfo = userInfo
        await aslak.attemptsTo(async (userAgent: TestUserAgent): Promise<TestUserAgent> => {
          await userAgent.createProject('Test Project')
          return userAgent
        })

        assert.deepStrictEqual(testDomainApi.messages[0], {
          userInfo,
          projectName: 'Test Project'
        })
      })
    })
  })
})
