import { get, camelCase, upperFirst } from 'lodash'
import { JSONSchema } from 'json-schema-ref-parser';

import { getSchemaName } from './compile'

interface RouteParameter {
  name: string
  schema: JSONSchema
}
interface RouteObject {
  operationId?: string
  parameters: RouteParameter[]
}

export class Route {
  public readonly route:RouteObject
  public readonly name:string
  public readonly requestTypeName:string
  constructor(route: RouteObject, {pathName, method}:{
    pathName: string, 
    method: string
  }) {
    this.route = route
    this.route.parameters = route.parameters || []

    this.name = upperFirst(camelCase(route.operationId || `${method} ${pathName}`))
    this.requestTypeName = `${this.name}Request`
  }

  requestParametersTypeDefinition():string {
    return this.route.parameters.length ? [
      `export interface ${this.requestTypeName} {`,
        ...this.route.parameters.map(param => 
          `  ${param.name}: ${getSchemaName(param.schema, param.name)}`),
      `}`
    ].join('\n') : ``
  }

  get responseSchema()  {
    return get(this.route, "responses.200.content['application/json'].schema")
  }
}