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
export interface IUserAgent<ViewModel> {
    viewModel: ViewModel;
}
export interface DollshouseConstructor<DomainApi, UserInfo, UserAgent extends IUserAgent<ViewModel>, ViewModel> {
    new (isDom: boolean, isHttp: boolean): Dollshouse<DomainApi, UserInfo, UserAgent, ViewModel>;
    readonly prototype: Dollshouse<DomainApi, UserInfo, UserAgent, ViewModel>;
}
export interface Dollshouse<DomainApi, UserInfo, UserAgent extends IUserAgent<ViewModel>, ViewModel> {
    start(): Promise<void>;
    stop(): Promise<void>;
    context(modifyContext: (domainApi: DomainApi) => void): Promise<void>;
    getCharacter(characterName: string): Character<UserInfo, UserAgent, ViewModel>;
}
export default function dollshouse<DomainApi, UserInfo, UserAgent extends IUserAgent<ViewModel>, ViewModel>(options: DollshouseOptions<DomainApi, UserInfo, UserAgent>): DollshouseConstructor<DomainApi, UserInfo, UserAgent, ViewModel>;
