import { IUserAgent } from "../src/Dollshouse"
import TestViewModel from "./TestViewModel"

export default interface TestUserAgent extends IUserAgent<TestViewModel> {
  createProject(projectName: string): Promise<void>

  start(): Promise<void>
}
