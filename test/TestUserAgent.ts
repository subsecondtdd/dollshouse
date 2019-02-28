import Project from "./Project"

export default interface TestUserAgent {
  projects: Project[]

  createProject(projectName: string): Promise<void>

  start(): Promise<void>
}
