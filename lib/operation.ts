import { camelCase, upperFirst } from 'lodash'
import { PathsObject, ParameterLocation, OperationObject, ParameterObject } from './typings/openapi';

export class Operation {
  public readonly route:OperationObject
  public readonly name:string
  public readonly method:string
  public readonly pathName:string
  constructor(route: OperationObject, {pathName, method}:{
    pathName: string, 
    method: string
  }) {
    this.route = route
    this.route.parameters = route.parameters || []
    this.name = upperFirst(camelCase(route.operationId || `${method} ${pathName}`))
    this.method = method
    this.pathName = pathName
  }

  hasAnyParametersIn(parameterLocation:ParameterLocation) {
    return !!(this.route.parameters || []).find((param) => (param as ParameterObject).in === parameterLocation)
  }
  parametersIn(parameterLocation:ParameterLocation) {
    return (this.route.parameters || []).filter(param => (param as ParameterObject).in === parameterLocation)
  }
  parameterNamesIn(parameterLocation:ParameterLocation) {
    return this.parametersIn(parameterLocation).map(param => (param as ParameterObject).name)
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