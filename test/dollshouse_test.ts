import * as assert from "assert"
import { MemoryStore } from "express-session"
import nodeFetch from "node-fetch"
// @ts-ignore
import fetchCookie from "fetch-cookie"
import dollshouse, { Dollshouse, DollshouseConstructor, DollshouseOptions } from "../src/Dollshouse"
import UserInfo from "../testapp/UserInfo"
import UserAgentCharacterAgent from "./UserAgentCharacterAgent"
import DomCharacterAgent from "./DomCharacterAgent"
import DomainApi from "../testapp/DomainApi"
import HttpUserAgent from "../testapp/HttpUserAgent"
import makeHttpServer from "../testapp/makeHttpServer"
import CharacterAgent from "./CharacterAgent"
import DomainUserAgent from "../testapp/DomainUserAgent"

describe('dollshouse', () => {
  let TestHouse: DollshouseConstructor<DomainApi, UserInfo, CharacterAgent>
  let house: Dollshouse<DomainApi, UserInfo, CharacterAgent>
  let domainApi: DomainApi

  beforeEach(async () => {
    domainApi = new DomainApi()

    const options: DollshouseOptions<DomainApi, UserInfo, CharacterAgent> = {
      makeDomainApi: () => domainApi,
      makeDomainCharacterAgent: async (api: DomainApi, userInfo: UserInfo) => new UserAgentCharacterAgent(new DomainUserAgent(api, userInfo)),
      makeHttpCharacterAgent: async (baseUrl: string, cookie: string) => new UserAgentCharacterAgent(new HttpUserAgent(baseUrl, cookie, {fetch: fetchCookie(nodeFetch)})),
      makeDomCharacterAgent: async ($characterNode: HTMLElement, characterAgent: CharacterAgent) => new DomCharacterAgent($characterNode, characterAgent.userAgent),
      makeHttpServer,
      sessionCookieName: 'session-id',
      makeSessionStore: () => new MemoryStore(),
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
  domConfig.forEach((dom: boolean) => {
    const httpConfig = [false, true]
    httpConfig.forEach((http: boolean) => {
      const nameParts = []
      if (dom) {
        nameParts.push('dom')
      }
      if (http) {
        nameParts.push('http')
      }
      nameParts.push('domain')
      const name = nameParts.join('-')

      it(`runs through ${name}`, async () => {
        house = new TestHouse({dom, http})
        await house.start()

        // Given a project exists
        await house.context((api: DomainApi) => api.createProject({userId: 'id-someone-else'}, 'Old Project'))

        // Given aslak is logged in
        const aslak = house.getCharacter('aslak')
        const userInfo: UserInfo = {userId: 'id-aslak-123'}
        aslak.userInfo = userInfo

        await aslak.attemptsTo(async (characterAgent: CharacterAgent) => {
          await characterAgent.start()
          await characterAgent.userAgent.createProject('Test Project')
        })

        // TODO: Wait for version to synchronise
        await new Promise(resolve => setTimeout(resolve, 100))

        const actualProjectNames = domainApi.getProjects(userInfo).map(p => p.projectName)
        const expectedProjectNames: string[] = ['Old Project', 'Test Project']
        assert.deepStrictEqual(actualProjectNames, expectedProjectNames)

        const projects = aslak.query<string[]>((characterAgent: CharacterAgent) => characterAgent.getProjectNames())
        assert.deepStrictEqual(projects, expectedProjectNames)
      })
    })
  })
})
