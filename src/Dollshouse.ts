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
  makeDomUserAgent: ($characterNode: HTMLElement, userAgent: UserAgent) => UserAgent
  makeHttpServer: (domainApi: DomainApi, sessionCookieName: string, sessionStore: Store | MemoryStore, sessionSecret: string) => Promise<http.Server>
  sessionCookieName: string,
  makeSessionStore: () => Store | MemoryStore
  sessionSecret: string
}

export interface DollshouseConstructor<UserInfo, UserAgent> {
  new(isDom: boolean, isHttp: boolean): Dollshouse<UserInfo, UserAgent>

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

    constructor(private readonly isDom: boolean, private readonly isHttp: boolean) {
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

      const makeHttpOrDomainUserAgent = (userInfo: UserInfo): UserAgent => {
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

      const makeUserAgent = (userInfo: UserInfo): UserAgent => {
        const userAgent = makeHttpOrDomainUserAgent(userInfo)
        if (this.isDom) {
          const $characterNode = this.makeCharacterNode(characterName, true)
          return options.makeDomUserAgent($characterNode, userAgent)
        } else {
          return userAgent
        }
      }

      const character = new Character(characterName, makeUserAgent)
      this.characters.set(characterName, character)
      return character
    }

    private makeCharacterNode(characterName: string, keepDom: boolean): HTMLElement {
      const loc = (typeof window === "object") ? window.location.href : undefined

      // Prevent previous scenario's URL from interfering
      window.history.pushState(undefined, undefined, loc)
      const div = document.createElement("div")
      div.innerHTML = `
        <style>
        * {
          box-sizing: border-box;
        }
        
        .dot {
          height: 12px;
          width: 12px;
          background-color: #bbb;
          border-radius: 50%;
          display: inline-block;
        }
        
        .character {
          float: right;
          color: #777777;
        }
        
        .container {
          border: 3px solid #f1f1f1;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          margin-bottom: 8px;
        }
        
        .top {
          padding: 10px;
          background: #f1f1f1;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
        }
        
        .content {
          padding: 10px;
        }

        .spinner {
          width: 40px;
          height: 40px;
        
          position: relative;
          margin: 100px auto;
        }
        
        .double-bounce1, .double-bounce2 {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #333;
          opacity: 0.6;
          position: absolute;
          top: 0;
          left: 0;
          
          -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
          animation: sk-bounce 2.0s infinite ease-in-out;
        }
        
        .double-bounce2 {
          -webkit-animation-delay: -1.0s;
          animation-delay: -1.0s;
        }
        
        @-webkit-keyframes sk-bounce {
          0%, 100% { -webkit-transform: scale(0.0) }
          50% { -webkit-transform: scale(1.0) }
        }
        
        @keyframes sk-bounce {
          0%, 100% { 
            transform: scale(0.0);
            -webkit-transform: scale(0.0);
          } 50% { 
            transform: scale(1.0);
            -webkit-transform: scale(1.0);
          }
        }
        </style>
        <div class="container">
          <div class="top">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="character">${characterName}</span>
          </div>
        
          <div class="content">
            <div class="spinner">
              <div class="double-bounce1"></div>
              <div class="double-bounce2"></div>
            </div>
          </div>
        </div>
      `

      document.body.appendChild(div)
      if (!keepDom) {
        this.stoppables.push(async () => {
          div.remove()
        })
      }

      const htmlElement = div.querySelector('.content') as HTMLElement
      if (!htmlElement) {
        throw new Error("No HTML Element?")
      }
      return htmlElement
    }

  }

  return DollshouseImpl
}
