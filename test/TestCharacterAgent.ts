import { ICharacterAgent } from "../src/Dollshouse"
import TestUserAgent from "./app/TestUserAgent"

export default interface TestCharacterAgent extends ICharacterAgent, TestUserAgent {
  getProjectNames(): string[]
}
