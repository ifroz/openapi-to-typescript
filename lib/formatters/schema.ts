import { JSONSchema } from 'json-schema-ref-parser'
import { compileSchema } from '../compile'
import { Formatter } from '../formatter'
export class SchemaFormatter extends Formatter<JSONSchema> {
  public readonly name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  public async render(schema: JSONSchema) {
    return {
      [this.name]: await compileSchema(schema, this.name),
    }
  }
}
