import Project from "./Project";
export default interface UserAgent {
    projects: Project[];
    createProject(projectName: string): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
}