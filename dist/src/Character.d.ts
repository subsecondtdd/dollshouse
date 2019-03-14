export default class Character<UserInfo, CharacterAgent> {
    readonly name: string;
    private readonly makeCharacterAgent;
    private readonly memory;
    private characterAgent;
    /**
     * User info for a character. This will be passed to the {@link makeCharacterAgent} function.
     * This is typically used to authenticate the character's user agent.
     */
    userInfo: UserInfo;
    constructor(name: string, makeCharacterAgent: (userInfo: UserInfo) => Promise<CharacterAgent>);
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
     * @param action a function that has a side-effect.
     */
    attemptsTo(action: (characterAgent: CharacterAgent) => Promise<void>): Promise<void>;
    /**
     * Queries the characterAgent.
     *
     * @param inspection a function that is passed the view model and returns a result derived from it.
     */
    query<Result>(inspection: (characterAgent: CharacterAgent) => Result): Result;
}
