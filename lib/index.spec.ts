import { GenerateTypings } from './index'
import execa from 'execa'

describe('GenerateTypings', () => {
  describe('given an empty openapi schema', () => {
    const schema = {
      components: {
        schemas: {}
      },
      paths: {}
    }
    itShouldGenerateValidTypingsFromSchema(schema)
    it('should respond nothing', async () => {
      const typeStore = await GenerateTypings(schema)
      expect(typeStore.toString()).toMatch(/^\s*$/)
      expect(typeStore.toString()).toEqual('')
    })
  })

  describe('given the Petstore schema', () => {
    const schema = require('../fixtures/petstore.json')
    itShouldGenerateValidTypingsFromSchema(schema)
    it('should output types for components.schemas ', async () => {
      const typeStore = await GenerateTypings(schema)
      expect(typeStore.toString()).toContain('export interface Pet')
      expect(typeStore.toString()).toContain('export type Pets = (Pet)[]')
    })
  })

  describe('given the Petstore Expanded schema', () => {
    const schema = require('../fixtures/petstoreExpanded.json')
    itShouldGenerateValidTypingsFromSchema(schema)
    it('should output types for components.schemas ', async () => {
      const typeStore = await GenerateTypings(schema)
      expect(typeStore.toString()).toContain('export type Pet = NewPet & {')
    })
  })
})

function itShouldGenerateValidTypingsFromSchema(schema:any) {
  it('should match snapshot', async () => {
    expect((await GenerateTypings(schema)).toString()).toMatchSnapshot()
  })

  it('does not contain $magic$', async () => {
    const typeStore = await GenerateTypings(schema)
    expect(typeStore.toString()).not.toContain('$magic$')
  })

  it('should evaluate', async () => {
    const typeStore = await GenerateTypings(schema)
    const typeDefs = typeStore.toString()
    if (typeDefs.length) await execa.stdout('ts-node', ['--eval', typeDefs])
  })
}