import { JSONSchema } from 'json-schema-ref-parser';
import { compileSchema } from '../compile';
import { Formatter } from '../formatter';
export class SchemaFormatter extends Formatter { 
  readonly schema:JSONSchema
  readonly name:string

  constructor(schema: JSONSchema, name: string) {
    super()
    this.schema = schema
    this.name = name
  }

  async render() {
    return {
      [this.name]: await compileSchema(this.schema, this.name)
    }
  }
}