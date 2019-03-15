import TestUserAgent from "./app/TestUserAgent"
import ReactDOM from "react-dom"
import * as ReactTestUtils from 'react-dom/test-utils'
import TestApp from "./app/TestApp"
import * as React from "react"
import Project from "./app/Project"
import TestCharacterAgent from "./TestCharacterAgent"

export default class DomTestCharacterAgent implements TestCharacterAgent {
  constructor(readonly $characterNode: HTMLElement, readonly userAgent: TestUserAgent) {
  }

  getProjectNames(): string[] {
    const projectNodes = this.$characterNode.querySelectorAll('.project')
    return Array.from(projectNodes).map(($projectNode: HTMLElement) => $projectNode.innerText)
  }

  public get projects(): Project[] {
    throw new Error("Use getProjectNames() instead")
  }

  async start(): Promise<void> {
    ReactDOM.render(<TestApp userAgent={this.userAgent}/>, this.$characterNode)
  }

  async createProject(projectName: string): Promise<void> {
    const button = this.$characterNode.querySelector('button')
    ReactTestUtils.Simulate.click(button)
  }

  async stop(): Promise<void> {
    // no-op
  }
}
