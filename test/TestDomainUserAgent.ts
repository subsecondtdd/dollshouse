import TestUserAgent from "./TestUserAgent"
import TestUserInfo from "./TestUserInfo"
import TestDomainApi from "./TestDomainApi"

export default class TestDomainUserAgent implements TestUserAgent {
  constructor(private readonly domainApi: TestDomainApi, private readonly userInfo: TestUserInfo) {
  }

  async createProject(projectName: string) {
    await this.domainApi.createProject(this.userInfo, projectName)
    return this
  }
}
