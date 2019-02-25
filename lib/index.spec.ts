import { GenerateTypings, GenerateTypingsOptions } from './index'
import execa from 'execa'
import { FetchClientFormatter } from './formatters';

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
    it('should output types for components.schemas', async () => {
      const typeStore = await GenerateTypings(schema)
      expect(typeStore.toString()).toContain('export interface Pet')
      expect(typeStore.toString()).toContain('export type Pets = (Pet)[]')
    })
  })

  describe('given the Petstore Expanded schema', () => {
    const schema = require('../fixtures/petstoreExpanded.json')
    itShouldGenerateValidTypingsFromSchema(schema)
    it('should output types for components.schemas', async () => {
      const typeStore = await GenerateTypings(schema)
      expect(typeStore.toString()).toContain('export type Pet = NewPet & {')
      expect(typeStore.toObject()).toHaveProperty('NewPet')
    })
    it('should output types for paths', async () => {
      const typeStore = await GenerateTypings(schema)
      const typeObject = typeStore.toObject()
      expect(typeObject).toHaveProperty('FindPetByIdRequest')
      expect(typeObject).toHaveProperty('FindPetByIdResult', 'export type FindPetByIdResult = Pet;\n')
      expect(typeObject).toHaveProperty('FindPetByIdFallback', 'export type FindPetByIdFallback = Error;\n')
    })

    describe('FetchClientFormatter', () => {
      const options = {
        operationFormatters: [FetchClientFormatter]
      }
      itShouldGenerateValidTypingsFromSchema(schema, options)
    })  
  })
})



function itShouldGenerateValidTypingsFromSchema(schema:any, options?:GenerateTypingsOptions) {
  it('should match snapshot', async () => {
    expect((await GenerateTypings(schema, options)).toString()).toMatchSnapshot()
  })

  it('does not contain $magic$', async () => {
    const typeStore = await GenerateTypings(schema, options)
    expect(typeStore.toString()).not.toContain('$magic$')
  })

  it('should evaluate', async () => {
    const typeStore = await GenerateTypings(schema, options)
    const typeDefs = typeStore.toString()
    if (typeDefs.length) await execa.stdout('ts-node', ['--eval', typeDefs])
  })
}