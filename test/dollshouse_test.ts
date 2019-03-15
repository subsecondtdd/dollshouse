import * as assert from "assert"
import { MemoryStore } from "express-session"
import nodeFetch from "node-fetch"
// @ts-ignore
import fetchCookie from "fetch-cookie"
import http from "http"
import dollshouse, { Dollshouse, DollshouseConstructor, DollshouseOptions } from "../src/Dollshouse"
import TestUserAgent from "./TestUserAgent"
import TestUserInfo from "./TestUserInfo"
import DomainTestCharacterAgent from "./DomainTestCharacterAgent"
import DomTestCharacterAgent from "./DomTestCharacterAgent"
import TestDomainApi from "./TestDomainApi"
import HttpTestCharacterAgent from "./HttpTestCharacterAgent"
import makeTestWebServer from "./makeTestWebServer"
import Project from "./Project"
import TestCharacterAgent from "./TestCharacterAgent"

describe('dollshouse', () => {
  let TestHouse: DollshouseConstructor<TestDomainApi, TestUserInfo, TestCharacterAgent>
  let house: Dollshouse<TestDomainApi, TestUserInfo, TestCharacterAgent>
  let testDomainApi: TestDomainApi

  beforeEach(async () => {
    testDomainApi = new TestDomainApi()

    const options: DollshouseOptions<TestDomainApi, TestUserInfo, TestCharacterAgent> = {
      makeDomainApi: () => testDomainApi,
      makeDomainCharacterAgent: async (domainApi: TestDomainApi, userInfo: TestUserInfo) => new DomainTestCharacterAgent(domainApi, userInfo),
      makeHttpCharacterAgent: async (baseUrl: string, cookie: string) => new HttpTestCharacterAgent(baseUrl, cookie, {fetch: fetchCookie(nodeFetch)}),
      makeDomCharacterAgent: async ($characterNode: HTMLElement, userAgent: TestUserAgent) => new DomTestCharacterAgent($characterNode, userAgent),
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
  // [CharacterAgent--ProtocolA]--ProtocolA Medium--[ProtocolA-1--CharacterAgent-ProtocolB]--ProtocolB-Medium--[...???
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
      nameParts.push('domain')
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

        await aslak.attemptsTo(async (characterAgent: TestCharacterAgent) => {
          await characterAgent.start()
          await characterAgent.createProject('Test Project')
        })

        // TODO: Wait for version to synchronise
        await new Promise(resolve => setTimeout(resolve, 100))

        const actualProjectNames = testDomainApi.getProjects(userInfo).map(p => p.projectName)
        const expectedProjectNames: string[] = ['Old Project','Test Project']
        assert.deepStrictEqual(actualProjectNames, expectedProjectNames)

        const projects = aslak.query<string[]>((characterAgent: TestCharacterAgent) => characterAgent.getProjectNames())
        assert.deepStrictEqual(projects, expectedProjectNames)
      })
    })
  })
})
