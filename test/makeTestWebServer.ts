import expressSession, { MemoryStore } from "express-session"
import TestDomainApi from "./TestDomainApi"
import express from "express"
import asyncHandler from "express-async-handler"
import TestUserInfo from "./TestUserInfo"
import DomainTestUserAgent from "./DomainTestUserAgent"
import http from "http"
import bodyParser = require("body-parser")

export default async function makeTestWebServer(sessionCookieName: string, sessionSecret: string, sessionStore: MemoryStore, domainApi: TestDomainApi) {
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
    const userInfo: TestUserInfo = req.session.userInfo
    const userAgent = new DomainTestUserAgent(domainApi, userInfo)
    await userAgent.createProject(projectName)
    res.end()
  }))

  app.get("/projects", asyncHandler(async (req, res) => {
    const userInfo: TestUserInfo = req.session.userInfo
    const userAgent = new DomainTestUserAgent(domainApi, userInfo)
    await userAgent.start()
    const projects = await userAgent.projects
    res.json(projects).end()
  }))

  return http.createServer(app)
}
