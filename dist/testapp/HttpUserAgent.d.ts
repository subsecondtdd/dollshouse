import UserAgent from "./UserAgent";
import Project from "./Project";
export default class HttpUserAgent implements UserAgent {
    private readonly baseUrl;
    private readonly cookie;
    private readonly fetcher;
    constructor(baseUrl: string, cookie: string, fetcher: GlobalFetch);
    projects: Project[];
    start(): Promise<void>;
    createProject(projectName: string): Promise<void>;
    getProjects(): Promise<Project[]>;
    stop(): Promise<void>;
}
