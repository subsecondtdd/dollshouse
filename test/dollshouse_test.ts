import * as assert from "assert"
// @ts-ignore
import { Dollshouse } from "../src/Dollshouse"
import UserInfo from "../testapp/UserInfo"
import DomainApi from "../testapp/DomainApi"
import CharacterAgent from "./CharacterAgent"
import TestHouse from "./TestHouse"

function verifyContract(makeHouse: () => Dollshouse<DomainApi, UserInfo, CharacterAgent>) {
  let house: Dollshouse<DomainApi, UserInfo, CharacterAgent>

  beforeEach(async () => {
    house = makeHouse()
    await house.start()
  })

  afterEach(async () => {
    await house.stop()
  })

  it("works", async () => {
    // Given aslak is logged in
    const aslak = house.getCharacter('aslak')
    aslak.userInfo = {userId: 'id-aslak-123'}

    // Given a project exists
    await house.context(api => api.createProject(aslak.userInfo, 'Old Project'))

    // When another one is created
    await aslak.attemptsTo(agent => agent.userAgent.createProject('Test Project'))

    await new Promise(resolve => setTimeout(resolve, 300))

    // Then there should be two projects
    const actualProjectNames = await aslak.query(agent => agent.projectNames)
    const expectedProjectNames: string[] = ['Old Project', 'Test Project']
    assert.deepStrictEqual(actualProjectNames, expectedProjectNames)
  })
}

describe("memory", () => {
  verifyContract(() => new TestHouse({dom: false, http: false}))
})

describe("http-memory", () => {
  verifyContract(() => new TestHouse({dom: false, http: true}))
})

describe("dom-memory", () => {
  verifyContract(() => new TestHouse({dom: true, http: false}))
})

describe("dom-http-memory", () => {
  verifyContract(() => new TestHouse({dom: true, http: true}))
})
