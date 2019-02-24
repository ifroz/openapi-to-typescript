import { get, camelCase, upperFirst } from 'lodash'

import { Operation, RouteParameter } from './operation'
import { compileSchema, getSchemaName } from './compile'
import { JSONSchema } from 'json-schema-ref-parser';

export abstract class OutputFormatter {
  protected readonly operation: Operation
  public readonly contentType: string

  constructor(operation: Operation, { contentType }: any = {}) {
    this.operation = operation
    this.contentType = (contentType || 'application/json').toString()
  }

  abstract async render():Promise<{[k: string]: string}>
}

export class RequestTypeFormatter extends OutputFormatter {
  async render():Promise<{[k: string]: string}> {
    const typeName = `${this.operation.name}Request`
    const parameters = this.operation.route.parameters || []
    return parameters.length ? {
      [typeName]: await this.toTypescriptInterface(typeName, parameters)
    } : {}
  }
  
  async toTypescriptInterface(typeName:string, parameters:RouteParameter[]) {
    return [
      `export interface ${typeName} {`,
        ...parameters.map(param => 
          `  ${param.name}: ${getSchemaName(param.schema, param.name)}`),
      `}`
    ].join('\n')
  }
}

export class ResultTypeFormatter extends OutputFormatter {
  async render():Promise<{[k: string]: string}> {
    const definitions = this.getResponseSchemaDefinitions()
    const compilations = await Promise.all(
      definitions.map(({ schema, typeName }) => 
        this.compileDefinition(typeName, schema))
    )
    return definitions.reduce((typeDefs, definition, index) => 
      Object.assign(typeDefs, {
        [definition.typeName]: compilations[index]
      }), {})
  }

  private async compileDefinition(typeName:string, schema:JSONSchema) {
    return schema ?
      compileSchema(schema, typeName) :
      `export interface ${typeName} { /* unknown */ }`
  }

  private getResponseSchemaDefinitions() {
    const responsesByStatusCode = get(this.operation.route, 'responses', {})
    const statusCodes = this.getStatusCodes(responsesByStatusCode)
    return statusCodes.map(((statusCode, index) => {
      const key = `responses['${statusCode}'].content[${this.contentType}].schema`
      const typeName = this.typeNameFor(statusCode, index)
      const schema = get(this.operation.route, key)
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

  private typeNameFor(suffix: number|string, index = 0) {
    if (index === 0) suffix = 'Result'
    return upperFirst(camelCase(`
      ${this.operation.name} 
      ${suffix === 'default' ? 'fallback' : suffix.toString()}
    `))
  }
}