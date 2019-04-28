/// <reference types="node" />
import UserInfo from "./UserInfo";
import Project from "./Project";
import { EventEmitter } from "events";
export default class DomainApi extends EventEmitter {
    private projects;
    createProject(userInfo: UserInfo, projectName: string): string;
    getProjects(userInfo: UserInfo): Project[];
}
