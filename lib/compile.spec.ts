import { compileSchema } from './compile'

describe('compileSchema', () => {
  it('should compile one component schema', async () => {
    const schemaName = 'Pet'
    const schema = require('../fixtures/petstore.json').components.schemas[schemaName]
    const compiled = await compileSchema(schema, schemaName)
    expect(compiled).toContain('export interface Pet {')
    expect(compiled).toMatch(/\}\s*$/)
    expect(compiled).toContain('tag?: string')
    expect(compiled).not.toContain('$magic$')
    expect(compiled).toContain('[k: string]: any')
  })
})
