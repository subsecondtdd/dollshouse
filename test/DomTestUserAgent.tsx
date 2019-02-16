import TestUserAgent from "./TestUserAgent"
import ReactDOM from "react-dom"
import * as ReactTestUtils from 'react-dom/test-utils'
import TestApp from "./TestApp"
import * as React from "react"
import Project from "./Project"
import TestViewModel from "./TestViewModel"

export default class DomTestUserAgent implements TestUserAgent {
  constructor(readonly $characterNode: HTMLElement, readonly userAgent: TestUserAgent) {
  }

  public viewModel: TestViewModel = this

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
}
