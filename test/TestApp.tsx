import * as React from "react"
import { useEffect, useState } from "react"
import TestUserAgent from "./TestUserAgent"
import Project from "./Project"

interface Props {
  userAgent: TestUserAgent
}

const TestApp: React.FunctionComponent<Props> = ({userAgent: ua}) => {

  const [userAgent, setUserAgent] = useState<TestUserAgent>(ua)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    userAgent.getProjects().then(setProjects)
  })

  async function createProject() {
    const ua = await userAgent.createProject("Test Project")
    setUserAgent(ua)
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
