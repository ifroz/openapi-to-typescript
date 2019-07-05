import { JSONSchema } from 'json-schema-ref-parser'
import { compileSchema } from '../compile'
import { ConcatFormatter } from '../formatter'
export class SchemaFormatter extends ConcatFormatter<JSONSchema> {
  public readonly name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  public async render(schema: JSONSchema) {
    return await compileSchema(schema, this.name)
  }
}
