import { GenerateTypings } from './index'

describe('openapi-typescript', () => {
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
        const typings = await GenerateTypings(schema)
        expect(typings).toMatch(/^\s*$/)
        expect(typings).toEqual('')
      })
    })

    describe('given the Petstore schema', () => {
      const schema = require('../fixtures/petstore.json')
      itShouldGenerateValidTypingsFromSchema(schema)
      it('should output types for components.schemas ', async () => {
        const typings = await GenerateTypings(schema)
        expect(typings).toContain('export interface Pet')
        expect(typings).toContain('export type Pets = (Pet)[]')
      })
    })

    describe('given the Petstore Expanded schema', () => {
      const schema = require('../fixtures/petstoreExpanded.json')
      itShouldGenerateValidTypingsFromSchema(schema)
      it('should output types for components.schemas ', async () => {
        const typings = await GenerateTypings(schema)
        expect(typings).toContain('export type Pet = NewPet & {')
      })
    })

  })
})

function itShouldGenerateValidTypingsFromSchema(schema:any) {
  it('should match snapshot', async () => {
    expect(await GenerateTypings(schema)).toMatchSnapshot()
  })

  it('does not contain $magic$', async () => {
    const typings = await GenerateTypings(schema)
    expect(typings).not.toContain('$magic$')
  })
}