import dollshouse, { DollshouseOptions } from "../src/Dollshouse"
import DomainApi from "../testapp/DomainApi"
import UserInfo from "../testapp/UserInfo"
import CharacterAgent from "./CharacterAgent"
import UserAgentCharacterAgent from "./UserAgentCharacterAgent"
import DomainUserAgent from "../testapp/DomainUserAgent"
import HttpUserAgent from "../testapp/HttpUserAgent"
import nodeFetch from "node-fetch"
// @ts-ignore
import fetchCookie from "fetch-cookie"
// @ts-ignore
import EventSource from "eventsource"
import DomCharacterAgent from "./DomCharacterAgent"
import makeHttpServer from "../testapp/makeHttpServer"
import { MemoryStore } from "express-session"

const options: DollshouseOptions<DomainApi, UserInfo, CharacterAgent> = {
  makeDomainApi: () => new DomainApi(),
  makeDomainCharacterAgent: async (api: DomainApi, userInfo: UserInfo) => new UserAgentCharacterAgent(new DomainUserAgent(api, userInfo)),
  makeHttpCharacterAgent: async (baseUrl: string, cookie: string) => new UserAgentCharacterAgent(new HttpUserAgent(
    baseUrl,
    cookie,
    {fetch: fetchCookie(nodeFetch)},
    (sseUrl, cookie) => new EventSource(sseUrl)
  )),
  makeDomCharacterAgent: async ($characterNode: HTMLElement, characterAgent: CharacterAgent) => new DomCharacterAgent($characterNode, characterAgent.userAgent),
  makeHttpServer,
  sessionCookieName: 'session-id',
  makeSessionStore: () => new MemoryStore(),
  sessionSecret: 'keyboard cat'
}
const TestHouse = dollshouse(options)

export default TestHouse
