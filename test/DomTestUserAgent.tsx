import TestUserAgent from "./TestUserAgent"
import ReactDOM from "react-dom"
import * as ReactTestUtils from 'react-dom/test-utils'
import TestApp from "./TestApp"
import * as React from "react"

export default class DomTestUserAgent implements TestUserAgent {
  constructor(readonly $characterNode: HTMLElement, readonly userAgent: TestUserAgent) {
    ReactDOM.render(<TestApp userAgent={userAgent}/>, this.$characterNode)
  }

  async createProject(projectName: string): Promise<TestUserAgent> {
    const button = this.$characterNode.querySelector('button')
    ReactTestUtils.Simulate.click(button)
    return this
  }
}