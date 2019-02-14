export default class Character<UserInfo = {}, UserAgent = {}> {
    readonly name: string;
    private readonly makeUserAgent;
    private readonly memory;
    private userAgent;
    /**
     * User info for a character. This will be passed to the {@link makeUserAgent} function.
     * This is typically used to asuthenticate the character's user agent.
     */
    userInfo: UserInfo;
    private viewModel;
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
    attemptsTo<T>(action: (userAgent: UserAgent) => Promise<any>): Promise<void>;
    query<ViewModel, T>(inspection: (viewModel: ViewModel) => T): Promise<T>;
}
