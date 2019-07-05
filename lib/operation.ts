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

  public get requestType() {
    return this.name + 'Request'
  }
  public get responseType() {
    return this.name + 'Result'
  }

  public hasAnyParametersIn(parameterLocation: ParameterLocation) {
    return !!(this.operationObject.parameters || []).find(this.isParameterInLocation(parameterLocation))
  }
  public parametersIn(parameterLocation: ParameterLocation) {
    return (this.operationObject.parameters || []).filter(this.isParameterInLocation(parameterLocation))
  }
  public parameterNamesIn(parameterLocation: ParameterLocation) {
    return this.parametersIn(parameterLocation).map((param) => (param as ParameterObject).name)
  }

  private isParameterInLocation(parameterLocation: ParameterLocation) {
    return (param: any) => (param as ParameterObject).in === parameterLocation
  }
}

export function extractOperations(paths: PathsObject): Operation[] {
  const operations = []
  for (const operation of eachOperation(paths)) operations.push(operation)
  return operations
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
