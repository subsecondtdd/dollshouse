
export default class Character<UserInfo, CharacterAgent> {
  private readonly memory = new Map<any, any>()
  private userAgent: CharacterAgent

  /**
   * User info for a character. This will be passed to the {@link makeUserAgent} function.
   * This is typically used to authenticate the character's user agent.
   */
  public userInfo: UserInfo

  constructor(public readonly name: string, private readonly makeUserAgent: (userInfo: UserInfo) => Promise<CharacterAgent>) {
  }

  /**
   * Remember something
   *
   * @param key the name of the thing to remember
   * @param value what to remember
   */
  public remember<T>(key: any, value: T) {
    this.memory.set(key, value)
  }

  /**
   * Recall something previously remembered
   *
   * @param key the name of the thing to recall
   * @return the value that was recalled
   * @throws Error if nothing can be recalled.
   */
  public recall<T>(key: any): T {
    if (!this.memory.has(key)) {
      throw new Error(`${this.name} does not recall anything about ${key}`)
    }
    return this.memory.get(key)
  }

  /**
   * Attempts to perform an action on behalf of the character.
   *
   * @param action a function that has a side-effect.
   */
  public async attemptsTo(action: (userAgent: CharacterAgent) => Promise<void>): Promise<void> {
    if (!this.userAgent) {
      this.userAgent = await this.makeUserAgent(this.userInfo)
    }
    await action(this.userAgent)
  }

  /**
   * Queries the userAgent.
   *
   * @param inspection a function that is passed the view model and returns a result derived from it.
   */
  public query<Result>(inspection: (userAgent: CharacterAgent) => Result): Result {
    if (!this.userAgent) {
      throw new Error(`No viewModel. [${this.name}] must attemptTo an action first`)
    }
    return inspection(this.userAgent)
  }
}
