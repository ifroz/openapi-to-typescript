import { get } from 'lodash'

import { OperationFormatter } from '../formatter'
import { RouteParameter } from '../operation'
import { getSchemaNameByRef, getSchemaName } from '../compile'

export class RequestTypeFormatter extends OperationFormatter {
  async render():Promise<{[k: string]: string}> {
    const typeName = `${this.operation.name}Request`
    const parameters = this.operation.route.parameters || []
    return {
      [typeName]: await this.toTypescriptInterface(typeName, parameters)
    }
  }
  
  async toTypescriptInterface(typeName:string, parameters:RouteParameter[]) {
    const requestSchema = get(this.operation.route, 'requestBody.content["application/json"].schema')
    const aliasedType = requestSchema && requestSchema.$ref && getSchemaNameByRef(requestSchema.$ref)
    if (aliasedType) return `export type ${typeName} = ${aliasedType}`
    else return [
      `export interface ${typeName} {`,
        ...parameters.map(param => 
          `  ${param.name}: ${getSchemaName(param.schema, param.name)}`),
      `}`
    ].join('\n')
  }
}
