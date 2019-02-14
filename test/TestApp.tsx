import * as React from "react"
import { useEffect, useState } from "react"
import TestUserAgent from "./TestUserAgent"
import Project from "./Project"

interface Props {
  userAgent: TestUserAgent
}

const TestApp: React.FunctionComponent<Props> = ({userAgent}) => {

  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      setProjects(await userAgent.getProjects())
    } catch (e) {
      console.error(e)
    }
  }

  async function createProject() {
    try {
      await userAgent.createProject("Test Project")
    } catch (e) {
      console.error(e)
    }
  }

  return <div>
    <h1>TestApp</h1>

    <button onClick={createProject}>Create</button>

    <ol>
      {projects.map((project, n) => <li key={`project-${n}`} className='project'>{project.projectName}</li>)}
    </ol>
  </div>
}

export default TestApp
