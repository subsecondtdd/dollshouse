export default class Character<UserInfo = {}, UserAgent = {}> {
  private readonly memory = new Map<any, any>()
  private userAgent: UserAgent

  /**
   * User info for a character. This will be passed to the {@link makeUserAgent} function.
   * This is typically used to asuthenticate the character's user agent.
   */
  public userInfo: UserInfo

  constructor(public readonly name: string, private readonly makeUserAgent: (userInfo: UserInfo) => Promise<UserAgent>) {
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

  async attemptsTo(action: (userAgent: UserAgent) => Promise<UserAgent>) {
    if (!this.userAgent) {
      this.userAgent = await this.makeUserAgent(this.userInfo)
    }
    this.userAgent = await action(this.userAgent)
  }

  async query<T>(inspection: (userAgent: UserAgent) => T): Promise<T> {
    if (!this.userAgent) {
      throw new Error(`No userAgent. Did the character attempt any actions?`)
    }
    return inspection(this.userAgent)
  }
}
