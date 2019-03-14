import TestUserAgent from "./TestUserAgent"
import TestCharacterAgent from "./TestCharacterAgent"

export default class UserAgentCharacterAgent implements TestCharacterAgent {
  constructor(private readonly testUserAgent: TestUserAgent) {

  }

  get projects() {
    return this.testUserAgent.projects
  }

  async createProject(projectName: string): Promise<void> {
    await this.testUserAgent.createProject(projectName)
  }

  async start(): Promise<void> {
    await this.testUserAgent.start()
  }

  async stop(): Promise<void> {
    await this.testUserAgent.stop()
  }


}
