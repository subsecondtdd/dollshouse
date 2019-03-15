import DomainUserAgent from "../testapp/DomainUserAgent"
import CharacterAgent from "./CharacterAgent"

export default class DomainCharacterAgent extends DomainUserAgent implements CharacterAgent {
  getProjectNames(): string[] {
    return this.projects.map(project => project.projectName)
  }
}
