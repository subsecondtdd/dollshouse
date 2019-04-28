import UserAgent from "../testapp/UserAgent"
import ReactDOM from "react-dom"
import * as ReactTestUtils from 'react-dom/test-utils'
import App from "../testapp/App"
import * as React from "react"
import CharacterAgent from "./CharacterAgent"
import { EventEmitter } from "events"

export default class DomCharacterAgent extends EventEmitter implements CharacterAgent {
  private readonly mob: MutationObserver
  public projectNames: string[] = []

  constructor(readonly $characterNode: HTMLElement, readonly userAgent: UserAgent) {
    super()
    this.mob = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => {
      this.updateProjectNames()
    })
  }

  public async start(): Promise<void> {
    this.mob.observe(this.$characterNode, {childList: true, subtree: true})
    ReactDOM.render(<App userAgent={this.userAgent}/>, this.$characterNode)
  }

  public async stop(): Promise<void> {
    ReactDOM.unmountComponentAtNode(this.$characterNode)
    this.mob.disconnect()
  }

  public async createProject(projectName: string): Promise<void> {
    const button = this.$characterNode.querySelector('button')
    ReactTestUtils.Simulate.click(button)
  }

  private updateProjectNames(): void {
    const projectNodes = this.$characterNode.querySelectorAll('.project')
    this.projectNames = Array.from(projectNodes).map(($projectNode: HTMLElement) => $projectNode.innerText)
  }
}
