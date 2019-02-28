import { camelCase, upperFirst } from 'lodash'
import { JSONSchema } from 'json-schema-ref-parser';
import { PathsObject } from './typings/openapi';

export interface RouteParameter {
  name: string
  schema: JSONSchema
  in: 'query'|'header'|'path'|'cookie'
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

export function eachOperation(paths:PathsObject) {
  return {
    *[Symbol.iterator]() {
        for (const pathName of Object.keys(paths)) {
          for (const method of Object.keys(paths[pathName])) {
            yield new Operation(paths[pathName][method], { pathName, method })
          }
        }
    }
  }
}