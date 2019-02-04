export default class Character<UserInfo={}, UserAgent={}> {
  private _userInfo: UserInfo
  private userAgent: UserAgent

  constructor(private readonly name: string, private readonly makeUserAgent: (userInfo: UserInfo) => UserAgent) {
  }

  set userInfo(userInfo: UserInfo) {
    this._userInfo = userInfo
  }

  async attemptsTo(action: (userAgent: UserAgent) => Promise<UserAgent>) {
    if (!this.userAgent) {
      this.userAgent = this.makeUserAgent(this._userInfo)
    }
    this.userAgent = await action(this.userAgent)
  }
}
