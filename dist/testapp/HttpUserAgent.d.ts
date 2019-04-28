/// <reference types="node" />
import UserAgent from "./UserAgent";
import Project from "./Project";
import { EventEmitter } from "events";
export default class HttpUserAgent extends EventEmitter implements UserAgent {
    private readonly baseUrl;
    private readonly cookie;
    private readonly fetcher;
    private readonly makeEventSource;
    private es;
    constructor(baseUrl: string, cookie: string, fetcher: GlobalFetch, makeEventSource: (baseUrl: string, cookie: string) => EventSource);
    createProject(projectName: string): Promise<string>;
    getProjects(): Promise<Project[]>;
    start(): Promise<void>;
    stop(): Promise<void>;
    private emitProjects;
}
