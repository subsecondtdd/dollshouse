import Project from "./Project"

export default interface TestUserAgent {
  createProject(projectName: string): Promise<TestUserAgent>

  getProjects(): Promise<Project[]>
}
