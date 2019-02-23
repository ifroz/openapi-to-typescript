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
      it('should respond nothing', async () => {
        const typings = await GenerateTypings(schema)
        expect(typings).toMatch(/^\s*$/)
        expect(typings).toEqual('')
      })
    })

    describe('given the Petstore schema', () => {
      const schema = require('../fixtures/petstore.json')

      it('should output types for components.schemas ', async () => {
        const typings = await GenerateTypings(schema)
        expect(typings).toContain('export interface Pet')
        expect(typings).toContain('export type Pets = (Pet)[]')
      })
    })

    describe('given the Petstore Expanded schema', () => {
      const schema = require('../fixtures/petstoreExpanded.json')

      it('should output types for components.schemas ', async () => {
        const typings = await GenerateTypings(schema)
        expect(typings).toContain('export type Pet = NewPet & {')
        // expect(typings).toMatch(/^\s*$/)
      })
    })

  })
})