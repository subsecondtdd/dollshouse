export default class Character<UserInfo = {}, UserAgent = {}> {
    private readonly name;
    private readonly makeUserAgent;
    private readonly memory;
    private _userInfo;
    private userAgent;
    constructor(name: string, makeUserAgent: (userInfo: UserInfo) => Promise<UserAgent>);
    /**
     * Sets user info. This will be passed to the {@link makeUserAgent} function.
     * This is typically used to asuthenticate the character's user agent.
     *
     * @param userInfo
     */
    userInfo: UserInfo;
    /**
     * Remember something
     *
     * @param key the name of the thing to remember
     * @param value what to remember
     */
    remember<T>(key: any, value: T): void;
    /**
     * Recall something previously remembered
     *
     * @param key the name of the thing to recall
     * @return the value that was recalled
     * @throws Error if nothing can be recalled.
     */
    recall<T>(key: any): T;
    attemptsTo(action: (userAgent: UserAgent) => Promise<UserAgent>): Promise<void>;
    query<T>(inspection: (userAgent: UserAgent) => T): Promise<T>;
}
