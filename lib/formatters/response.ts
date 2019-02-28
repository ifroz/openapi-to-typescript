import { JSONSchema } from 'json-schema-ref-parser'
import { get, camelCase, upperFirst } from 'lodash'

import { Formatter } from '../formatter'
import { compileSchema } from '../compile'
import { Operation } from 'lib/operation';

export class ResultTypeFormatter extends Formatter<Operation> {
  public readonly contentType: string = 'application/json'

  async render(operation:Operation):Promise<{[k: string]: string}> {
    const definitions = this.getResponseSchemaDefinitions(operation)
    const compilations = await Promise.all(
      definitions.map(({ schema, typeName }) => 
        this.compileDefinition(schema, typeName))
    )
    return definitions.reduce((typeDefs, definition, index) => 
      Object.assign(typeDefs, {
        [definition.typeName]: compilations[index]
      }), {})
  }

  private async compileDefinition(schema:JSONSchema, typeName:string) {
    return schema ?
      compileSchema(schema, typeName) :
      `export type ${typeName} = any`
  }

  private getResponseSchemaDefinitions(operation:Operation):ResponseSchemaDefinition[] {
    const responsesByStatusCode = get(operation.route, 'responses', {})
    const statusCodes = this.getStatusCodes(responsesByStatusCode)
    return statusCodes.map(((statusCode, index):ResponseSchemaDefinition => {
      const key = `responses['${statusCode}'].content[${this.contentType}].schema`
      const typeName = this.typeNameFor(operation, index === 0 ? 'Result' : statusCode)
      const schema = get(operation.route, key)
      return { schema, statusCode, typeName }
    }))
  }

  private getStatusCodes(responsesByStatusCode: any) {
    const whitelist: (number|string)[] = ['default']
    return Object.keys(responsesByStatusCode)
      .map(n => whitelist.includes(n) ? n : parseInt(n))
      .filter(n => whitelist.includes(n) || n >= 200 && n < 400)
      .sort()
  }

  private typeNameFor(operation:Operation, suffix: number|string) {
    return upperFirst(camelCase(`
      ${operation.name} 
      ${suffix === 'default' ? 'fallback' : suffix.toString()}
    `))
  }
}

interface ResponseSchemaDefinition {
  schema: JSONSchema,
  typeName: string,
  statusCode: number|string|'default'
}