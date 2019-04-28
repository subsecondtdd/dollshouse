import expressSession, { MemoryStore, Store } from "express-session"
import DomainApi from "./DomainApi"
import express from "express"
import asyncHandler from "express-async-handler"
import UserInfo from "./UserInfo"
import DomainUserAgent from "./DomainUserAgent"
import http from "http"
import bodyParser from "body-parser"
// @ts-ignore
import SseStream from "ssestream"
import { PassThrough } from "stream"

export default async function makeHttpServer(
  domainApi: DomainApi,
  sessionCookieName: string,
  sessionStore: Store | MemoryStore,
  sessionSecret: string
) {
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
    const id = await userAgent.createProject(projectName)
    res.end(id)
  }))

  app.get("/projects", asyncHandler(async (req, res) => {
    const userInfo: UserInfo = req.session.userInfo
    const userAgent = new DomainUserAgent(domainApi, userInfo)
    const projects = await userAgent.getProjects()
    res.json(projects).end()
  }))

  app.get("/sse", (req, res) => {
    const sse = new SseStream(req)

    const notifications = new PassThrough({objectMode: true})
    const userInfo: UserInfo = req.session.userInfo
    const userAgent = new DomainUserAgent(domainApi, userInfo)
    userAgent.start().catch(err => {
      console.error(err)
      res.status(500).end()
    })

    userAgent.on("projects", () => notifications.write({event: "projects", data: "x"}))
    notifications.pipe(sse).pipe(res)

    req.on("close", () => {
      notifications.unpipe(sse)
      userAgent.stop().catch(err => console.error(err))
    })
  })

  return http.createServer(app)
}
