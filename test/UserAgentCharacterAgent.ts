import CharacterAgent from "./CharacterAgent"
import UserAgent from "../testapp/UserAgent"

export default class UserAgentCharacterAgent implements CharacterAgent {
  public projectNames: string[] = []

  constructor(public readonly userAgent: UserAgent) {
    this.updateProjectNames = this.updateProjectNames.bind(this)
  }

  public async start(): Promise<void> {
    this.userAgent.on("open", this.updateProjectNames)
    this.userAgent.on("projects", this.updateProjectNames)
    this.userAgent.on("error", evt => console.error(evt))
    await this.userAgent.start()
  }

  public async stop(): Promise<void> {
    await this.userAgent.stop()
    this.userAgent.off("projects", this.updateProjectNames)
    this.userAgent.off("open", this.updateProjectNames)
  }

  private updateProjectNames(): void {
    this.userAgent.getProjects()
      .then(projects => this.projectNames = projects.map(project => project.projectName))
      .catch(err => console.error(err))
  }
}
