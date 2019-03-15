import UserAgent from "./UserAgent"
import UserInfo from "./UserInfo"
import DomainApi from "./DomainApi"
import Project from "./Project"

export default class DomainUserAgent implements UserAgent {
  constructor(
    private readonly domainApi: DomainApi,
    private readonly userInfo: UserInfo,
  ) {
  }

  public projects: Project[] = []

  async start(): Promise<void> {
    this.projects = this.domainApi.getProjects(this.userInfo)
  }

  async createProject(projectName: string): Promise<void> {
    this.domainApi.createProject(this.userInfo, projectName)
  }

  async stop(): Promise<void> {
    // no-op
  }
}
