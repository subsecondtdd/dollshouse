import UserInfo from "./UserInfo";
import Project from "./Project";
export default class TestDomainApi {
    private projects;
    createProject(userInfo: UserInfo, projectName: string): void;
    getProjects(userInfo: UserInfo): Project[];
}
