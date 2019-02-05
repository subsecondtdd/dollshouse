export default interface TestUserAgent {
  createProject(projectName: string): Promise<TestUserAgent>
}
