import UserInfo from "./UserInfo"
import Project from "./Project"
import nanoid from "nanoid"
import { EventEmitter } from "events"

export default class DomainApi extends EventEmitter {
  private projects = new Map<string, Project>()

  public createProject(userInfo: UserInfo, projectName: string): string {
    if (!userInfo) {
      throw new Error('createProject not allowed')
    }
    const project = {projectName}
    const id = nanoid()
    this.projects.set(id, project)
    this.emit("projects")
    return id
  }

  public getProjects(userInfo: UserInfo): Project[] {
    if (!userInfo) {
      throw new Error('getProjects not allowed')
    }
    return Array.from(this.projects.values())
  }
}
