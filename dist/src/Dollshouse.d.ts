/// <reference types="node" />
import { MemoryStore, Store } from "express-session";
import http from "http";
import Character from "./Character";
export interface DollshouseOptions<DomainApi, UserInfo, CharacterAgent> {
    makeDomainApi: () => DomainApi;
    makeDomainCharacterAgent: (domainApi: DomainApi, userInfo: UserInfo) => Promise<CharacterAgent>;
    makeHttpCharacterAgent: (baseUrl: string, cookie: string) => Promise<CharacterAgent>;
    makeDomCharacterAgent: ($characterNode: HTMLElement, characterAgent: CharacterAgent) => Promise<CharacterAgent>;
    makeHttpServer: (domainApi: DomainApi, sessionCookieName: string, sessionStore: Store | MemoryStore, sessionSecret: string) => Promise<http.Server>;
    sessionCookieName: string;
    makeSessionStore: () => Store | MemoryStore;
    sessionSecret: string;
}
export interface DollshouseConstructor<DomainApi, UserInfo, UserAgent extends ICharacterAgent> {
    new (isDom: boolean, isHttp: boolean): Dollshouse<DomainApi, UserInfo, UserAgent>;
    readonly prototype: Dollshouse<DomainApi, UserInfo, UserAgent>;
}
export interface Dollshouse<DomainApi, UserInfo, UserAgent> {
    start(): Promise<void>;
    stop(): Promise<void>;
    context(modifyContext: (domainApi: DomainApi) => void): Promise<void>;
    getCharacter(characterName: string): Character<UserInfo, UserAgent>;
}
export interface ICharacterAgent {
    stop(): Promise<void>;
}
export default function dollshouse<DomainApi, UserInfo, CharacterAgent extends ICharacterAgent>(options: DollshouseOptions<DomainApi, UserInfo, CharacterAgent>): DollshouseConstructor<DomainApi, UserInfo, CharacterAgent>;
