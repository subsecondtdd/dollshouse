import { MemoryStore, Store } from "express-session"
import http from "http"
import Character from "./Character"
import { promisify } from "util"
import { AddressInfo } from "net"
import nanoid from "nanoid"
import signature from "cookie-signature"
import { serialize } from "cookie"

export interface DollshouseOptions<DomainApi, UserInfo, CharacterAgent> {
  makeDomainApi: () => DomainApi,
  makeDomainCharacterAgent: (domainApi: DomainApi, userInfo: UserInfo) => Promise<CharacterAgent>
  makeHttpCharacterAgent: (baseUrl: string, cookie: string) => Promise<CharacterAgent>
  makeDomCharacterAgent: ($characterNode: HTMLElement, characterAgent: CharacterAgent) => Promise<CharacterAgent>
  makeHttpServer: (domainApi: DomainApi, sessionCookieName: string, sessionStore: Store | MemoryStore, sessionSecret: string) => Promise<http.Server>
  sessionCookieName: string,
  makeSessionStore: () => Store | MemoryStore
  sessionSecret: string
}

interface Configuration {
  dom: boolean,
  http: boolean
}

export interface DollshouseConstructor<DomainApi, UserInfo, CharacterAgent extends ICharacterAgent> {
  new(configuration: Configuration): Dollshouse<DomainApi, UserInfo, CharacterAgent>

  readonly prototype: Dollshouse<DomainApi, UserInfo, CharacterAgent>
}

export interface Dollshouse<DomainApi, UserInfo, CharacterAgent> {
  start(): Promise<void>

  stop(): Promise<void>

  context(modifyContext: (domainApi: DomainApi) => void): Promise<void>

  getCharacter(characterName: string): Character<UserInfo, CharacterAgent>
}

export interface ICharacterAgent {
  stop(): Promise<void>
}

export default function dollshouse<DomainApi, UserInfo, CharacterAgent extends ICharacterAgent>(
  options: DollshouseOptions<DomainApi, UserInfo, CharacterAgent>
): DollshouseConstructor<DomainApi, UserInfo, CharacterAgent> {
  class DollshouseImpl implements Dollshouse<DomainApi, UserInfo, CharacterAgent> {
    private readonly characters = new Map<string, Character<UserInfo, CharacterAgent>>()
    private readonly stoppables: Array<() => void> = []
    private baseUrl: string
    private sessionStore: Store | MemoryStore

    private readonly domainApi: DomainApi

    constructor(private readonly configuration: Configuration) {
      this.domainApi = options.makeDomainApi()
    }

    public async start() {
      if (this.configuration.http) {
        this.sessionStore = options.makeSessionStore()
        const server = await options.makeHttpServer(this.domainApi, options.sessionCookieName, this.sessionStore, options.sessionSecret)
        const listen = promisify(server.listen.bind(server))
        await listen()
        this.stoppables.push(async () => {
          // If the server has a stop method (such as https://github.com/hunterloftis/stoppable) - use that
          // @ts-ignore
          const stop = server.stop || server.close
          const close = promisify(stop.bind(server))
          await close()
        })
        const addr = server.address() as AddressInfo
        const port = addr.port
        this.baseUrl = `http://localhost:${port}`
      }
    }

    public async stop() {
      for (const stoppable of this.stoppables.reverse()) {
        await stoppable()
      }
    }

    /**
     * Creates a new agent that can be used to interact with the system. This method can be called directly from
     * unit testing tools like Mocha or Jest, but if you're using Cucumber, we recommend registering a parameter type
     * that calls {@link getCharacter} instead.
     *
     * @param userInfo - the userInfo to use to identify a character.
     * @param characterName - the name of the character (can be undefined unless you're using a DOM).
     */
    public async makeCharacterAgent(userInfo: UserInfo, characterName?: string): Promise<CharacterAgent> {
      const httpOrDomainCharacterAgent = await this.makeHttpOrDomainCharacterAgent(userInfo)
      let characterAgent: CharacterAgent
      if (this.configuration.dom) {
        const $characterNode = this.makeCharacterNode(characterName, true)
        characterAgent = await options.makeDomCharacterAgent($characterNode, httpOrDomainCharacterAgent)
      } else {
        characterAgent = httpOrDomainCharacterAgent
      }
      this.stoppables.push(characterAgent.stop.bind(characterAgent))
      return characterAgent
    }

    public async context<T>(modifyContext: (domainApi: DomainApi) => T): Promise<T> {
      return modifyContext(this.domainApi)
    }

    public getCharacter(characterName: string): Character<UserInfo, CharacterAgent> {
      if (this.characters.has(characterName)) { return this.characters.get(characterName) }
      const character = new Character<UserInfo, CharacterAgent>(characterName, this.makeCharacterAgent.bind(this))
      this.characters.set(characterName, character)
      return character
    }

    private async makeHttpOrDomainCharacterAgent(userInfo: UserInfo): Promise<CharacterAgent> {
      if (this.configuration.http) {
        const cookie = {
          originalMaxAge: Number.MAX_SAFE_INTEGER,
          maxAge: Number.MAX_SAFE_INTEGER,
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
        return options.makeHttpCharacterAgent(this.baseUrl, clientCookie)
      } else {
        return options.makeDomainCharacterAgent(this.domainApi, userInfo)
      }
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
