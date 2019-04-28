import UserAgent from "./UserAgent"
import Project from "./Project"
import { EventEmitter } from "events"

export default class HttpUserAgent extends EventEmitter implements UserAgent {
  private readonly makeEventSource: (baseUrl: string, cookie: string) => EventSource
  private es: EventSource

  constructor(
    private readonly baseUrl: string,
    private readonly cookie: string,
    private readonly fetcher: GlobalFetch,
    makeEventSource: (baseUrl: string, cookie: string) => EventSource) {
    super()
    this.makeEventSource = makeEventSource
    this.emitProjects = this.emitProjects.bind(this)
  }

  public async createProject(projectName: string): Promise<string> {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    }
    if (this.cookie) {
      headers.Cookie = this.cookie
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

    return res.text()
  }

  public async getProjects(): Promise<Project[]> {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    }
    if (this.cookie) {
      headers.Cookie = this.cookie
    }
    const res = await this.fetcher.fetch(`${this.baseUrl}/projects`, {
      method: "GET",
      headers
    })
    if (!res.ok) {
      const errorMessage = await res.text()
      throw new Error(errorMessage)
    }
    return res.json()
  }

  public async start(): Promise<void> {
    this.es = this.makeEventSource(`${this.baseUrl}/sse`, this.cookie)
    this.es.onopen = () => this.emit("open")
    this.es.onerror = (evt: MessageEvent) => this.emit("error", evt.data)
    this.es.addEventListener("projects", this.emitProjects)
  }

  public async stop(): Promise<void> {
    this.es.removeEventListener("projects", this.emitProjects)
    this.es.close()
    this.es = null
  }

  private emitProjects() {
    this.emit("projects")
  }
}
