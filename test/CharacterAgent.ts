import { ICharacterAgent } from "../src/Dollshouse"
import UserAgent from "../testapp/UserAgent"

export default interface CharacterAgent extends ICharacterAgent, UserAgent {
  getProjectNames(): string[]
}
