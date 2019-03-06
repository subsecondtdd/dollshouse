import Project from "./Project"
import { IUserAgent } from "../src/Dollshouse"

export default interface TestUserAgent extends IUserAgent {
  projects: Project[]

  createProject(projectName: string): Promise<void>

  start(): Promise<void>
}
