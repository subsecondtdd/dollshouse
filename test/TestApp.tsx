import * as React from "react"
import TestUserAgent from "./TestUserAgent"

interface Props {
  userAgent: TestUserAgent
}

const TestApp: React.FunctionComponent<Props> = ({userAgent}) => {
  return <div>
    <h1>TestApp</h1>

    <button onClick={async () => await userAgent.createProject("Test Project")}>Create</button>
  </div>
}

export default TestApp
