export default class Character<UserInfo = {}, UserAgent = {}> {
  private _userInfo: UserInfo
  private userAgent: UserAgent

  constructor(private readonly name: string, private readonly makeUserAgent: (userInfo: UserInfo) => Promise<UserAgent>) {
  }

  set userInfo(userInfo: UserInfo) {
    this._userInfo = userInfo
  }

  async attemptsTo(action: (userAgent: UserAgent) => Promise<UserAgent>) {
    if (!this.userAgent) {
      this.userAgent = await this.makeUserAgent(this._userInfo)
    }
    this.userAgent = await action(this.userAgent)
  }

  async query<T>(inspection: (userAgent: UserAgent) => T): Promise<T> {
    return inspection(this.userAgent)
  }
}
