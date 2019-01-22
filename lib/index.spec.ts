import { GenerateTypes } from './index'

describe('openapi-typescript', () => {
  describe('GenerateTypes', () => {
    describe('given an empty openapi schema', () => {
      it('should respond nothing', async () => {
        const schema = {
          components: {
            schemas: {}
          },
          paths: {}
        }
        expect((await GenerateTypes(schema)).trim()).toEqual('')
      })
    })
  })
})