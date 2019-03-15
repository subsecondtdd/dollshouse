import CharacterAgent from "./CharacterAgent"
import HttpUserAgent from "../testapp/HttpUserAgent"

export default class HttpCharacterAgent extends HttpUserAgent implements CharacterAgent {
  getProjectNames(): string[] {
    return this.projects.map(project => project.projectName)
  }
}
