import execa from 'execa'
import { FetchClientFormatter } from './formatters'
import { GenerateTypings, GenerateTypingsOptions } from './index'
import { OpenAPIObject } from './typings/openapi'

describe('GenerateTypings', () => {
  describe('given an empty openapi schema', () => {
    const schema: OpenAPIObject = {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Some API',
      },
      components: {
        schemas: {},
      },
      paths: {},
    }
    itShouldGenerateValidTypingsFromSchema(schema)
    it('should respond nothing', async () => {
      const { typeStore } = await GenerateTypings(schema)
      expect(typeStore.toString()).toMatch(/^\s*$/)
      expect(typeStore.toString()).toEqual('')
    })
  })

  describe('given the Petstore schema', () => {
    const schema = require('../fixtures/petstore.json')
    itShouldGenerateValidTypingsFromSchema(schema)
    it('should output types for components.schemas', async () => {
      const { typeStore } = await GenerateTypings(schema)
      expect(typeStore.toString()).toContain('export interface Pet')
      expect(typeStore.toString()).toContain('export type Pets = (Pet)[]')
    })
  })

  describe('given the Petstore Expanded schema', () => {
    const schema = require('../fixtures/petstoreExpanded.json')
    itShouldGenerateValidTypingsFromSchema(schema)
    it('should output types for components.schemas', async () => {
      const { typeStore } = await GenerateTypings(schema)
      expect(typeStore.toString()).toContain('export type Pet = NewPet & {')
      expect(typeStore.toObject()).toHaveProperty('NewPet')
    })
    it('should output types for paths', async () => {
      const { typeStore } = await GenerateTypings(schema)
      const typeObject = typeStore.toObject()
      expect(typeObject).toHaveProperty('FindPetByIdRequest')
      expect(typeObject).toHaveProperty('FindPetByIdResult', 'export type FindPetByIdResult = Pet;\n')
      expect(typeObject).toHaveProperty('FindPetByIdFallback', 'export type FindPetByIdFallback = Error;\n')
    })

    describe('FetchClientFormatter', () => {
      const options = {
        operationFormatters: [new FetchClientFormatter()],
      }
      itShouldGenerateValidTypingsFromSchema(schema, options)

      it('should generate client actions', async () => {
        const { typeStore, clientStore } = await GenerateTypings(schema, options)
        expect(clientStore.toObject()).toMatchObject({
          AddPet: expect.stringContaining('method: "post"'),
        })
      })
    })
  })
})

function itShouldGenerateValidTypingsFromSchema(schema: any, options?: GenerateTypingsOptions) {
  it('should match typeStore snapshot', async () => {
    expect((await GenerateTypings(schema, options)).typeStore.toString()).toMatchSnapshot()
  })

  it('should match clientStore snapshot', async () => {
    expect((await GenerateTypings(schema, options)).clientStore.toString()).toMatchSnapshot()
  })

  it('does not contain $magic$', async () => {
    const { typeStore } = await GenerateTypings(schema, options)
    expect(typeStore.toString()).not.toContain('$magic$')
  })

  it('should evaluate', async () => {
    const { typeStore, clientStore } = await GenerateTypings(schema, options)
    const typeDefs = typeStore.toString()
    const clientDefs = clientStore.toString()
    const generatedTypescriptCode = typeDefs + '\n' + clientDefs
    // console.log(evaluatedTypescriptCode)
    if (typeDefs.length) await execa.stdout('ts-node', ['--eval', generatedTypescriptCode])
  })
}
