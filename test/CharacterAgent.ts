import { ICharacterAgent } from "../src/Dollshouse"
import UserAgent from "../testapp/UserAgent"

export default interface CharacterAgent extends ICharacterAgent {
  userAgent: UserAgent
  start(): Promise<void>
  getProjectNames(): string[]
}
