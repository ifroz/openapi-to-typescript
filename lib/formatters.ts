import { get, camelCase, upperFirst } from 'lodash'

import { Operation } from './operation'
import { compileSchema, getSchemaName } from './compile'
import { compile } from 'json-schema-to-typescript';

export abstract class OutputFormatter {
  protected readonly operation: Operation
  public readonly contentType: string

  constructor(operation: Operation, { contentType }: any = {}) {
    this.operation = operation
    this.contentType = (contentType || 'application/json').toString()
  }

  abstract typeName(): string
  abstract async toTypescript(): Promise<string>
}

export class RequestTypeFormatter extends OutputFormatter {
  typeName() {
    return `${this.operation.name}Request`
  }

  async toTypescript() {
    const parameters = this.operation.route.parameters || []
    return parameters.length ? [
      `export interface ${this.typeName()} {`,
        ...parameters.map(param => 
          `  ${param.name}: ${getSchemaName(param.schema, param.name)}`),
      `}`
    ].join('\n') : ``
  }
}

export class ResultTypeFormatter extends OutputFormatter {
  typeName() {
    return this.typeNameWithSuffix('Result')
  }
  private typeNameWithSuffix(suffix: number|string) {
    return upperFirst(camelCase(`
      ${this.operation.name} 
      ${suffix === 'default' ? 'fallback' : suffix.toString()}
    `))
  }

  async toTypescript() {
    const definitions = this.getResponseSchemaDefinitions()
    const compilations = await Promise.all(
      definitions.map(({ schema, statusCode }, index) => {
        const name = index === 0 ?
          this.typeName() : 
          this.typeNameWithSuffix(statusCode)
        return schema ? 
          compileSchema(schema, name) :
          `export interface ${name} { /* unknown */ }`
      }))
    return compilations.join(`\n`)
  }

  private getResponseSchemaDefinitions() {
    const responsesByStatusCode = get(this.operation.route, 'responses', {})
    const statusCodes = this.getStatusCodes(responsesByStatusCode)
    return statusCodes.map((statusCode => {
      const key = `responses['${statusCode}'].content[${this.contentType}].schema`
      const schema = get(this.operation.route, key)
      return { schema, statusCode }
    }))
  }

  private getStatusCodes(responsesByStatusCode: any) {
    const whitelist: (number|string)[] = ['default']
    return Object.keys(responsesByStatusCode)
      .map(n => whitelist.includes(n) ? n : parseInt(n))
      .filter(n => whitelist.includes(n) || n >= 200 && n < 400)
      .sort()
  }
}