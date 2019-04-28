import Project from "./Project"
import { EventEmitter } from "events"

/**
 * Emitted events:
 * - open - when the connection is open
 * - error - when the connection errors
 * - projects - when the project has changed
 */
export default interface UserAgent extends EventEmitter {
  start(): Promise<void>
  stop(): Promise<void>

  getProjects(): Promise<Project[]>
  createProject(projectName: string): Promise<string>
}
