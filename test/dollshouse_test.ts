import * as assert from "assert"
import { MemoryStore } from "express-session"
import nodeFetch from "node-fetch"
// @ts-ignore
import fetchCookie from "fetch-cookie"
import http from "http"
import dollshouse, { Dollshouse, DollshouseConstructor, DollshouseOptions } from "../src/Dollshouse"
import TestUserAgent from "./TestUserAgent"
import TestUserInfo from "./TestUserInfo"
import DomainTestUserAgent from "./DomainTestUserAgent"
import DomTestUserAgent from "./DomTestUserAgent"
import TestDomainApi from "./TestDomainApi"
import HttpTestUserAgent from "./HttpTestUserAgent"
import makeTestWebServer from "./makeTestWebServer"
import Project from "./Project"
import TestViewModel from "./TestViewModel"

describe('dollshouse', () => {
  let TestHouse: DollshouseConstructor<TestDomainApi, TestUserInfo, TestUserAgent, TestViewModel>
  let house: Dollshouse<TestDomainApi, TestUserInfo, TestUserAgent, TestViewModel>
  let testDomainApi: TestDomainApi

  beforeEach(async () => {
    testDomainApi = new TestDomainApi()

    const options: DollshouseOptions<TestDomainApi, TestUserInfo, TestUserAgent> = {
      makeDomainApi: () => testDomainApi,
      makeDomainUserAgent: async (domainApi: TestDomainApi, userInfo: TestUserInfo) => new DomainTestUserAgent(domainApi, userInfo),
      makeHttpUserAgent: async (baseUrl: string, cookie: string) => new HttpTestUserAgent(baseUrl, cookie, {fetch: fetchCookie(nodeFetch)}),
      makeDomUserAgent: async ($characterNode: HTMLElement, userAgent: TestUserAgent) => new DomTestUserAgent($characterNode, userAgent),
      makeHttpServer: async (domainApi: TestDomainApi, sessionCookieName: string, sessionStore: MemoryStore, sessionSecret: string) =>
        makeTestWebServer(sessionCookieName, sessionSecret, sessionStore, domainApi),
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
  //
  // [UserAgent--ProtocolA]--ProtocolA Medium--[ProtocolA-1--UserAgent-ProtocolB]--ProtocolB-Medium--[...???
  const domConfig = [false, true]
  domConfig.forEach((isDom: boolean) => {
    const httpConfig = [false, true]
    httpConfig.forEach((isHttp: boolean) => {
      const nameParts = []
      if (isDom) {
        nameParts.push('dom')
      }
      if (isHttp) {
        nameParts.push('http')
      }
      {
        nameParts.push('domain')
      }
      const name = nameParts.join('-')

      it(`runs through ${name}`, async () => {
        house = new TestHouse(isDom, isHttp)
        await house.start()

        // Given a project exists
        await house.context((api: TestDomainApi) => api.createProject({userId: 'id-someone-else'}, 'Old Project'))

        // Given aslak is logged in
        const aslak = house.getCharacter('aslak')
        const userInfo: TestUserInfo = {userId: 'id-aslak-123'}
        aslak.userInfo = userInfo

        await aslak.attemptsTo(async (userAgent: TestUserAgent) => {
          await userAgent.start()
          await userAgent.createProject('Test Project')
        })

        // TODO: Wait for version to synchronise
        await new Promise(resolve => setTimeout(resolve, 100))

        const expectedProjects: Project[] = [
          {
            projectName: 'Old Project'
          },
          {
            projectName: 'Test Project'
          }
        ]
        assert.deepStrictEqual(testDomainApi.getProjects(userInfo), expectedProjects)

        const projects = aslak.query<Project[]>((viewModel: TestViewModel) => viewModel.projects)
        assert.deepStrictEqual(projects, expectedProjects)
      })
    })
  })
})
