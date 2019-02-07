import TestUserAgent from "./TestUserAgent"
import Project from "./Project"

export default class HttpTestUserAgent implements TestUserAgent {
  constructor(
    private readonly baseUrl: string,
    private readonly cookie: string,
    private readonly fetcher: GlobalFetch
  ) {
  }

  async createProject(projectName: string): Promise<TestUserAgent> {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    }
    if (this.cookie) {
      headers["Cookie"] = this.cookie
    }

    const res = await this.fetcher.fetch(`${this.baseUrl}/projects`, {
      method: "POST",
      body: JSON.stringify({
        projectName
      }),
      headers
    })
    if (!res.ok) {
      const errorMessage = await res.text()
      throw new Error(errorMessage)
    }
    return this
  }

  async getProjects(): Promise<Project[]> {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    }
    if (this.cookie) {
      headers["Cookie"] = this.cookie
    }
    const res = await this.fetcher.fetch(`${this.baseUrl}/projects`, {
      method: "GET",
      headers
    })
    if (!res.ok) {
      const errorMessage = await res.text()
      throw new Error(errorMessage)
    }
    return await res.json()
  }
}
