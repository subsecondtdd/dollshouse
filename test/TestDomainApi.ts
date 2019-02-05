import TestUserInfo from "./TestUserInfo"

export default class TestDomainApi {
  messages: Array<{ userInfo: TestUserInfo, projectName: string }> = []

  createProject(userInfo: TestUserInfo, projectName: string) {
    this.messages.push({userInfo, projectName})
  }
}
