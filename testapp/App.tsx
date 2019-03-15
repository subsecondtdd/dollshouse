import * as React from "react"
import { useEffect, useState } from "react"
import UserAgent from "./UserAgent"
import Project from "./Project"

interface Props {
  userAgent: UserAgent
}

const App: React.FunctionComponent<Props> = ({userAgent}) => {

  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    start()
  }, [])

  async function start() {
    try {
      await userAgent.start()
      setProjects(await userAgent.projects)
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

export default App
