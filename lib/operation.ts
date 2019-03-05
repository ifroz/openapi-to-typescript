import { camelCase, upperFirst } from 'lodash'
import { OperationObject, ParameterLocation, ParameterObject, PathsObject } from './typings/openapi'

export class Operation {
  public readonly operationObject: OperationObject
  public readonly name: string
  public readonly method: string
  public readonly pathName: string
  constructor(operationObject: OperationObject, {pathName, method}: {
    pathName: string,
    method: string,
  }) {
    this.operationObject = operationObject
    this.operationObject.parameters = operationObject.parameters || []
    this.name = upperFirst(camelCase(operationObject.operationId || `${method} ${pathName}`))
    this.method = method
    this.pathName = pathName
  }

  public hasAnyParametersIn(parameterLocation: ParameterLocation) {
    return !!(this.operationObject.parameters || []).find((param) => (param as ParameterObject).in === parameterLocation)
  }
  public parametersIn(parameterLocation: ParameterLocation) {
    return (this.operationObject.parameters || []).filter((param) => (param as ParameterObject).in === parameterLocation)
  }
  public parameterNamesIn(parameterLocation: ParameterLocation) {
    return this.parametersIn(parameterLocation).map((param) => (param as ParameterObject).name)
  }
}

export function eachOperation(paths: PathsObject) {
  return {
    *[Symbol.iterator]() {
        for (const pathName of Object.keys(paths)) {
          for (const method of Object.keys(paths[pathName])) {
            yield new Operation(paths[pathName][method], { pathName, method })
          }
        }
    },
  }
}
