import { MemoryStore, Store } from "express-session"
import http from "http"
import Character from "./Character"
import { promisify } from "util"
import { AddressInfo } from "net"
import nanoid from "nanoid"
import signature from "cookie-signature"
import { serialize } from "cookie"

export interface DollshouseOptions<DomainApi, UserInfo, UserAgent> {
  makeDomainApi: () => DomainApi,
  makeDomainUserAgent: (domainApi: DomainApi, userInfo: UserInfo) => UserAgent
  makeHttpUserAgent: (baseUrl: string, cookie: string) => UserAgent
  makeHttpServer: (domainApi: DomainApi, sessionCookieName: string, sessionStore: Store | MemoryStore, sessionSecret: string) => Promise<http.Server>
  sessionCookieName: string,
  makeSessionStore: () => Store | MemoryStore
  sessionSecret: string
}

export interface DollshouseConstructor<UserInfo, UserAgent> {
  new(isHttp: boolean): Dollshouse<UserInfo, UserAgent>

  readonly prototype: Dollshouse<UserInfo, UserAgent>
}

export interface Dollshouse<UserInfo, UserAgent> {
  start(): Promise<void>

  stop(): Promise<void>

  getCharacter(characterName: string): Promise<Character<UserInfo, UserAgent>>
}

export default function dollshouse<DomainApi, UserInfo, UserAgent>(options: DollshouseOptions<DomainApi, UserInfo, UserAgent>): DollshouseConstructor<UserInfo, UserAgent> {
  class DollshouseImpl implements Dollshouse<UserInfo, UserAgent> {
    private readonly characters = new Map<string, Character<UserInfo, UserAgent>>()
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

    async getCharacter(characterName: string): Promise<Character<UserInfo, UserAgent>> {
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
