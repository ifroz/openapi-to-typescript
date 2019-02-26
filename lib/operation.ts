import { camelCase, upperFirst } from 'lodash'
import { JSONSchema } from 'json-schema-ref-parser';

export interface RouteParameter {
  name: string
  schema: JSONSchema
}
interface RouteObject {
  operationId?: string
  parameters: RouteParameter[]
}

export class Operation {
  public readonly route:RouteObject
  public readonly name:string
  public readonly method:string
  constructor(route: RouteObject, {pathName, method}:{
    pathName: string, 
    method: string
  }) {
    this.route = route
    this.route.parameters = route.parameters || []
    this.name = upperFirst(camelCase(route.operationId || `${method} ${pathName}`))
    this.method = method
  }
}