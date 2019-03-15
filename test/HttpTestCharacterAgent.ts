import TestCharacterAgent from "./TestCharacterAgent"
import HttpTestUserAgent from "./app/HttpTestUserAgent"

export default class HttpTestCharacterAgent extends HttpTestUserAgent implements TestCharacterAgent {
  getProjectNames(): string[] {
    return this.projects.map(project => project.projectName)
  }
}
