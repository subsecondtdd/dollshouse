import DomainTestUserAgent from "./app/DomainTestUserAgent"
import TestCharacterAgent from "./TestCharacterAgent"

export default class DomainTestCharacterAgent extends DomainTestUserAgent implements TestCharacterAgent {
  getProjectNames(): string[] {
    return this.projects.map(project => project.projectName)
  }
}
