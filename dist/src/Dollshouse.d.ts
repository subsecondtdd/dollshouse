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
interface Configuration {
    dom: boolean;
    http: boolean;
}
export interface DollshouseConstructor<DomainApi, UserInfo, CharacterAgent extends ICharacterAgent> {
    new (configuration: Configuration): Dollshouse<DomainApi, UserInfo, CharacterAgent>;
    readonly prototype: Dollshouse<DomainApi, UserInfo, CharacterAgent>;
}
export interface Dollshouse<DomainApi, UserInfo, CharacterAgent> {
    start(): Promise<void>;
    stop(): Promise<void>;
    context<T>(modifyContext: (domainApi: DomainApi) => T): Promise<T>;
    getCharacter(characterName: string): Character<UserInfo, CharacterAgent>;
}
export interface ICharacterAgent {
    start(): Promise<void>;
    stop(): Promise<void>;
}
export default function dollshouse<DomainApi, UserInfo, CharacterAgent extends ICharacterAgent>(options: DollshouseOptions<DomainApi, UserInfo, CharacterAgent>): DollshouseConstructor<DomainApi, UserInfo, CharacterAgent>;
export {};
