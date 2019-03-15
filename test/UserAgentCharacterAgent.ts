import CharacterAgent from "./CharacterAgent"
import UserAgent from "../testapp/UserAgent"

export default class UserAgentCharacterAgent implements CharacterAgent {
  constructor(public readonly userAgent: UserAgent) {
  }

  getProjectNames(): string[] {
    return this.userAgent.projects.map(project => project.projectName)
  }

  start(): Promise<void> {
    return this.userAgent.start()
  }

  stop(): Promise<void> {
    return this.userAgent.stop()
  }
}
