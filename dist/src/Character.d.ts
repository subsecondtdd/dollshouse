export default class Character<UserInfo = {}, UserAgent = {}> {
    private readonly name;
    private readonly makeUserAgent;
    private _userInfo;
    private userAgent;
    constructor(name: string, makeUserAgent: (userInfo: UserInfo) => Promise<UserAgent>);
    userInfo: UserInfo;
    attemptsTo(action: (userAgent: UserAgent) => Promise<UserAgent>): Promise<void>;
    query<T>(inspection: (userAgent: UserAgent) => T): Promise<T>;
}
