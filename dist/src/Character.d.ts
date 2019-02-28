export default class Character<UserInfo, UserAgent> {
    readonly name: string;
    private readonly makeUserAgent;
    private readonly memory;
    private userAgent;
    /**
     * User info for a character. This will be passed to the {@link makeUserAgent} function.
     * This is typically used to authenticate the character's user agent.
     */
    userInfo: UserInfo;
    constructor(name: string, makeUserAgent: (userInfo: UserInfo) => Promise<UserAgent>);
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
    /**
     * Attempts to perform an action on behalf of the character.
     *
     * @param action a function that returns a new view model (which can be queried later).
     */
    attemptsTo<ViewModel>(action: (userAgent: UserAgent) => Promise<ViewModel>): Promise<void>;
    /**
     * Queries the userAgent.
     *
     * @param inspection a function that is passed the view model and returns a result derived from it.
     */
    query<Result>(inspection: (userAgent: UserAgent) => Result): Result;
}
