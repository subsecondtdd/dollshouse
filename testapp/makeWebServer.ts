import expressSession, { MemoryStore } from "express-session"
import DomainApi from "./DomainApi"
import express from "express"
import asyncHandler from "express-async-handler"
import UserInfo from "./UserInfo"
import DomainUserAgent from "./DomainUserAgent"
import http from "http"
import bodyParser = require("body-parser")

export default async function makeWebServer(sessionCookieName: string, sessionSecret: string, sessionStore: MemoryStore, domainApi: DomainApi) {
  const app = express()
  app.use(expressSession({
    name: sessionCookieName,
    secret: sessionSecret,
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
  }))
  app.use(bodyParser.json())

  app.post("/projects", asyncHandler(async (req, res) => {
    const {projectName} = req.body
    const userInfo: UserInfo = req.session.userInfo
    const userAgent = new DomainUserAgent(domainApi, userInfo)
    await userAgent.createProject(projectName)
    res.end()
  }))

  app.get("/projects", asyncHandler(async (req, res) => {
    const userInfo: UserInfo = req.session.userInfo
    const userAgent = new DomainUserAgent(domainApi, userInfo)
    await userAgent.start()
    const projects = await userAgent.projects
    res.json(projects).end()
  }))

  return http.createServer(app)
}
