import UserAgent from "../testapp/UserAgent"
import ReactDOM from "react-dom"
import * as ReactTestUtils from 'react-dom/test-utils'
import App from "../testapp/App"
import * as React from "react"
import Project from "../testapp/Project"
import CharacterAgent from "./CharacterAgent"

export default class DomCharacterAgent implements CharacterAgent {
  constructor(readonly $characterNode: HTMLElement, readonly userAgent: UserAgent) {
  }

  getProjectNames(): string[] {
    const projectNodes = this.$characterNode.querySelectorAll('.project')
    return Array.from(projectNodes).map(($projectNode: HTMLElement) => $projectNode.innerText)
  }

  public get projects(): Project[] {
    throw new Error("Use getProjectNames() instead")
  }

  async start(): Promise<void> {
    ReactDOM.render(<App userAgent={this.userAgent}/>, this.$characterNode)
  }

  async createProject(projectName: string): Promise<void> {
    const button = this.$characterNode.querySelector('button')
    ReactTestUtils.Simulate.click(button)
  }

  async stop(): Promise<void> {
    // no-op
  }
}
