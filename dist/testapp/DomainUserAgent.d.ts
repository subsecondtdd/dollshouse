/// <reference types="node" />
import UserAgent from "./UserAgent";
import UserInfo from "./UserInfo";
import DomainApi from "./DomainApi";
import Project from "./Project";
import { EventEmitter } from "events";
export default class DomainUserAgent extends EventEmitter implements UserAgent {
    private readonly domainApi;
    private readonly userInfo;
    constructor(domainApi: DomainApi, userInfo: UserInfo);
    createProject(projectName: string): Promise<string>;
    getProjects(): Promise<Project[]>;
    start(): Promise<void>;
    stop(): Promise<void>;
    private emitProjects;
}
