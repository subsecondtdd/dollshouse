import TestUserInfo from "./TestUserInfo"
import Project from "./Project"

export default class TestDomainApi {
  private projects: Project[] = []

  createProject(userInfo: TestUserInfo, projectName: string) {
    if (!userInfo) throw new Error('createProject not allowed')
    this.projects.push({projectName})
  }

  getProjects(userInfo: TestUserInfo) {
    if (!userInfo) throw new Error('getProjects not allowed')
    return this.projects
  }
}
