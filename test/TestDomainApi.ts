import TestUserInfo from "./TestUserInfo"
import Project from "./Project"

export default class TestDomainApi {
  private projects: Project[] = []

  createProject(userInfo: TestUserInfo, projectName: string): void {
    if (!userInfo) throw new Error('createProject not allowed')
    const project = {projectName}
    this.projects.push(project)
  }

  getProjects(userInfo: TestUserInfo) {
    if (!userInfo) throw new Error('getProjects not allowed')
    return this.projects
  }
}
