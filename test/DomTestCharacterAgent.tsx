import TestUserAgent from "./TestUserAgent"
import ReactDOM from "react-dom"
import * as ReactTestUtils from 'react-dom/test-utils'
import TestApp from "./TestApp"
import * as React from "react"
import Project from "./Project"
import TestCharacterAgent from "./TestCharacterAgent"

export default class DomTestCharacterAgent implements TestCharacterAgent {
  constructor(readonly $characterNode: HTMLElement, readonly userAgent: TestUserAgent) {
  }

  public get projects(): Project[] {
    const projectNodes = this.$characterNode.querySelectorAll('.project')
    return Array.from(projectNodes).map(($projectNode: HTMLElement) => {
      return {
        projectName: $projectNode.innerText
      }
    })
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