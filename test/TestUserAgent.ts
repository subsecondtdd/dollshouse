import Project from "./Project"

export default interface TestUserAgent {
  createProject(projectName: string): Promise<void>

  getProjects(): Promise<Project[]>
}
