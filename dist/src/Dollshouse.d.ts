import { MemoryStore, Store } from "express-session";
import http from "http";
import Character from "./Character";
export interface DollshouseOptions<DomainApi, UserInfo, UserAgent> {
    makeDomainApi: () => DomainApi;
    makeDomainUserAgent: (domainApi: DomainApi, userInfo: UserInfo) => Promise<UserAgent>;
    makeHttpUserAgent: (baseUrl: string, cookie: string) => Promise<UserAgent>;
    makeDomUserAgent: ($characterNode: HTMLElement, userAgent: UserAgent) => Promise<UserAgent>;
    makeHttpServer: (domainApi: DomainApi, sessionCookieName: string, sessionStore: Store | MemoryStore, sessionSecret: string) => Promise<http.Server>;
    sessionCookieName: string;
    makeSessionStore: () => Store | MemoryStore;
    sessionSecret: string;
}
export interface DollshouseConstructor<UserInfo, UserAgent> {
    new (isDom: boolean, isHttp: boolean): Dollshouse<UserInfo, UserAgent>;
    readonly prototype: Dollshouse<UserInfo, UserAgent>;
}
export interface Dollshouse<UserInfo, UserAgent> {
    start(): Promise<void>;
    stop(): Promise<void>;
    getCharacter(characterName: string): Promise<Character<UserInfo, UserAgent>>;
}
export default function dollshouse<DomainApi, UserInfo, UserAgent>(options: DollshouseOptions<DomainApi, UserInfo, UserAgent>): DollshouseConstructor<UserInfo, UserAgent>;
