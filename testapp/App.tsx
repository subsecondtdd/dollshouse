import React from "react"
import UserAgent from "./UserAgent"
import Project from "./Project"

interface Props {
  userAgent: UserAgent
}

const App: React.FunctionComponent<Props> = ({userAgent}) => {

  const [projects, setProjects] = React.useState<Project[]>([])
  const [error, setError] = React.useState<Error>(null)

  React.useEffect(() => {
    userAgent.on("open", updateProjects)
    userAgent.on("projects", updateProjects)
    userAgent.on("error", evt => setError(new Error("User agent error")))
    userAgent.start().catch((err: Error) => setError(err))

    return () => {
      userAgent.stop().catch((err: Error) => setError(err))
      userAgent.off("error", evt => setError(new Error("User agent error")))
      userAgent.off("projects", updateProjects)
      userAgent.off("open", updateProjects)
    }
  }, [])

  function updateProjects() {
    userAgent.getProjects()
      .then(setProjects)
      .catch(setError)
  }

  function createProject() {
    userAgent.createProject("Test Project")
      .catch(setError)
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
