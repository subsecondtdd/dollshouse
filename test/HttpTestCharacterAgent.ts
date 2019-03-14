import DomainTestUserAgent from "./DomainTestUserAgent"
import TestCharacterAgent from "./TestCharacterAgent"
import HttpTestUserAgent from "./HttpTestUserAgent"

export default class HttpTestCharacterAgent extends HttpTestUserAgent implements TestCharacterAgent {
  getProjectNames(): string[] {
    return this.projects.map(project => project.projectName)
  }
}
