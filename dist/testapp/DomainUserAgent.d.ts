import UserAgent from "./UserAgent";
import UserInfo from "./UserInfo";
import DomainApi from "./DomainApi";
import Project from "./Project";
export default class DomainUserAgent implements UserAgent {
    private readonly domainApi;
    private readonly userInfo;
    constructor(domainApi: DomainApi, userInfo: UserInfo);
    projects: Project[];
    start(): Promise<void>;
    createProject(projectName: string): Promise<void>;
    stop(): Promise<void>;
}
