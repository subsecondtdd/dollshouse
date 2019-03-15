/// <reference types="node" />
import { MemoryStore, Store } from "express-session";
import DomainApi from "./DomainApi";
import http from "http";
export default function makeHttpServer(domainApi: DomainApi, sessionCookieName: string, sessionStore: Store | MemoryStore, sessionSecret: string): Promise<http.Server>;
