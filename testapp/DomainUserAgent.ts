import UserAgent from "./UserAgent"
import UserInfo from "./UserInfo"
import DomainApi from "./DomainApi"
import Project from "./Project"
import { EventEmitter } from "events"

export default class DomainUserAgent extends EventEmitter implements UserAgent {
  constructor(
    private readonly domainApi: DomainApi,
    private readonly userInfo: UserInfo,
  ) {
    super()
    this.emitProjects = this.emitProjects.bind(this)
  }

  public async createProject(projectName: string): Promise<string> {
    return this.domainApi.createProject(this.userInfo, projectName)
  }

  public async getProjects(): Promise<Project[]> {
    return this.domainApi.getProjects(this.userInfo)
  }

  public async start(): Promise<void> {
    this.domainApi.on("projects", this.emitProjects)
    this.emit("open")
  }

  public async stop(): Promise<void> {
    this.domainApi.off("projects", this.emitProjects)
  }

  private emitProjects() {
    this.emit("projects")
  }
}
