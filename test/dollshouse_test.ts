import * as assert from "assert"

class Character<UserAgent, UserInfo> {
  private userAgent: UserAgent
  private userInfo: UserInfo

  constructor(private readonly name: string, private readonly makeUserAgent: (userInfo: UserInfo) => UserAgent) {

  }

  async attemptsTo(action: (userAgent: UserAgent) => Promise<UserAgent>) {
    if (!this.userAgent) {
      this.userAgent = this.makeUserAgent(this.userInfo)
    }
    this.userAgent = await action(this.userAgent)
  }
}

interface DollshouseOptions<DomainApi, UserAgent, UserInfo> {
  makeDomainApi: () => DomainApi,
  makeDomainUserAgent: (domainApi: DomainApi, userInfo: UserInfo) => UserAgent
}

interface DollshouseConstructor<UserAgent, UserInfo> {
  new(): Dollshouse<UserAgent, UserInfo>

  readonly prototype: Dollshouse<UserAgent, UserInfo>
}

interface Dollshouse<UserAgent, UserInfo> {
  start(): Promise<void>

  getCharacter(characterName: string): Promise<Character<UserAgent, UserInfo>>
}

function dollshouse<DomainApi, UserAgent, UserInfo>(options: DollshouseOptions<DomainApi, UserAgent, UserInfo>): DollshouseConstructor<UserAgent, UserInfo> {
  class DollshouseImpl implements Dollshouse<UserAgent, UserInfo> {
    private readonly characters = new Map<string, Character<UserAgent, UserInfo>>()
    private domainApi: DomainApi

    async start() {
      this.domainApi = options.makeDomainApi()
    }

    async getCharacter(characterName: string): Promise<Character<UserAgent, UserInfo>> {
      if (this.characters.has(characterName)) return this.characters.get(characterName)

      const makeUserAgent = (userInfo: UserInfo): UserAgent => {
        return options.makeDomainUserAgent(this.domainApi, userInfo)
      }

      const actor = new Character(characterName, makeUserAgent)
      this.characters.set(characterName, actor)
      return actor
    }
  }

  return DollshouseImpl
}

interface TestUserAgent {
  createProject(projectName: string): Promise<void>
}

class TestDomainUserAgent implements TestUserAgent {
  constructor(private readonly domainApi: TestDomainApi, private readonly userId: string) {
  }

  async createProject(projectName: string) {
    await this.domainApi.createProject(this.userId, projectName)
  }
}

interface TestUserInfo {

}

class TestDomainApi {
  messages: Array<{ userInfo: TestUserInfo, projectName: string }> = []

  createProject(userInfo: TestUserInfo, projectName: string) {
    this.messages.push({userInfo, projectName})
  }
}

describe('dollshouse', () => {
  it('runs through domain user agent', async () => {
    const testDomainApi = new TestDomainApi()
    const options: DollshouseOptions<TestDomainApi, TestUserAgent, TestUserInfo> = {
      makeDomainApi: () => testDomainApi,
      makeDomainUserAgent: (domainApi: TestDomainApi, userId: string) => new TestDomainUserAgent(domainApi, userId)
    }
    const TestHouse = dollshouse(options)
    const house = new TestHouse()
    await house.start()

    const aslak = await house.getCharacter('aslak')
    await aslak.attemptsTo(async (userAgent: TestUserAgent): Promise<TestUserAgent> => {
      await userAgent.createProject('Test Project')
      return userAgent
    })

    assert.deepStrictEqual(testDomainApi.messages[0], {userInfo: undefined, projectName: 'Test Project'})
  })
})
