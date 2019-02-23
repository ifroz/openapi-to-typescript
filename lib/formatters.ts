import { get } from 'lodash'

import { RouteDefinition } from './route-definition'
import { compileSchema, getSchemaName } from './compile'
import { compile } from 'json-schema-to-typescript';

export abstract class OutputFormatter {
  protected readonly routeDefinition: RouteDefinition
  public readonly contentType: string

  constructor(route: RouteDefinition, { contentType }: any = {}) {
    this.routeDefinition = route
    this.contentType = (contentType || 'application/json').toString()
  }

  abstract typeName(): string
  abstract async toTypescript(): Promise<string>
}

export class RequestTypeFormatter extends OutputFormatter {
  typeName() {
    return `${this.routeDefinition.name}Request`
  }

  async toTypescript() {
    const parameters = this.routeDefinition.route.parameters || []
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
    return `${this.routeDefinition.name}${suffix}`
  }

  async toTypescript() {
    const definitions = this.getResponseSchemaDefinitions()
    const compilations = await Promise.all(
      definitions.map(({ schema, statusCode }, index) => 
        compileSchema(
          schema, 
          index === 0 ?
            this.typeName() : 
            this.typeNameWithSuffix(statusCode))))
    return compilations.join(`\n`)
  }

  private getResponseSchemaDefinitions() {
    const responsesByStatusCode = get(this.routeDefinition.route, 'responses', {})
    const statusCodes = this.getStatusCodes(responsesByStatusCode)
    return statusCodes.map(((statusCode, index) => {
      const key = `responses['${statusCode}'].content[${this.contentType}].schema`
      const schema = get(this.routeDefinition.route, key)
      return { schema, statusCode }
    }))
  }

  private getStatusCodes(responsesByStatusCode: any) {
    const whitelist = ['default']
    return Object.keys(responsesByStatusCode)
      .map(n => whitelist.includes(n) ? n : parseInt(n))
      .filter(n => n >= 200 && n < 400)
      .sort()
  }
}