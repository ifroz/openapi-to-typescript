import { GenerateTypes } from './index'

describe('openapi-typescript', () => {
  describe('GenerateTypes', () => {
    describe('given an empty openapi schema', () => {
      const schema = {
        components: {
          schemas: {}
        },
        paths: {}
      }
      it('should respond nothing', async () => {
        expect((await GenerateTypes(schema))).toMatch(/\s*/)
      })
    })
  })
})