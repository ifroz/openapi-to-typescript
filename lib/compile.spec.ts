import { compileSchema } from './compile'

describe('compileSchema', () => {
  it('should compile one component', async () => {
    const schemaName = 'Pet'
    const schema = require('../fixtures/petstore.json').components.schemas[schemaName]
    const compiled = await compileSchema(schema, schemaName)
    expect(compiled).toContain('export interface Pet {')
    expect(compiled).toMatch(/\}\s*$/)
    expect(compiled).toContain('tag?: string')
  })
})