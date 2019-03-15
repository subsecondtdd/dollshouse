/// <reference types="node" />
import { MemoryStore } from "express-session";
import DomainApi from "./DomainApi";
import http from "http";
export default function makeWebServer(sessionCookieName: string, sessionSecret: string, sessionStore: MemoryStore, domainApi: DomainApi): Promise<http.Server>;
