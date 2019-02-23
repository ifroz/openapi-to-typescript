import { get } from 'lodash'

import { RouteDefinition } from './route-definition'
import { compileSchema, getSchemaName } from './compile'

export abstract class OutputFormatter {
  protected routeDefinition: RouteDefinition
  constructor(route: RouteDefinition) {
    this.routeDefinition = route
  }

  abstract get typeName(): string
  abstract async toTypescript(): Promise<string>
}

export class RequestTypeFormatter extends OutputFormatter {
  get typeName() {
    return `${this.routeDefinition.name}Request`
  }

  async toTypescript() {
    const parameters = this.routeDefinition.route.parameters || []
    return parameters.length ? [
      `export interface ${this.typeName} {`,
        ...parameters.map(param => 
          `  ${param.name}: ${getSchemaName(param.schema, param.name)}`),
      `}`
    ].join('\n') : ``
  }
}

export class ResultTypeFormatter extends OutputFormatter {
  get typeName() {
    return `${this.routeDefinition.name}Result`
  }

  toTypescript() {
    return compileSchema(this.responseSchema, this.typeName)
  }


  get responseSchema()  {
    return get(this.routeDefinition.route, "responses.200.content['application/json'].schema")
  }
}