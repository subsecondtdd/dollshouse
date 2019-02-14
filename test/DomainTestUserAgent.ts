import TestUserAgent from "./TestUserAgent"
import TestUserInfo from "./TestUserInfo"
import TestDomainApi from "./TestDomainApi"
import Project from "./Project"

export default class DomainTestUserAgent implements TestUserAgent {
  constructor(
    private readonly domainApi: TestDomainApi,
    private readonly userInfo: TestUserInfo,
  ) {
  }

  async createProject(projectName: string): Promise<void> {
    this.domainApi.createProject(this.userInfo, projectName)
  }

  async getProjects(): Promise<Project[]> {
    return this.domainApi.getProjects(this.userInfo)
  }
}
