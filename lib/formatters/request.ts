import { get } from 'lodash'

import { Formatter } from '../formatter'
import { Operation } from '../operation'
import { getSchemaNameByRef, getSchemaName } from '../compile'
import { ParameterObject } from '../typings/openapi';
import { JSONSchema } from 'json-schema-ref-parser';

export class RequestTypeFormatter extends Formatter<Operation> {
  async render(operation:Operation):Promise<{[k: string]: string}> {
    const typeName = `${operation.name}Request`
    const parameters = operation.route.parameters || []
    return {
      [typeName]: await this.toTypescriptInterface(operation, typeName, parameters as ParameterObject[])
    }
  }
  
  async toTypescriptInterface(operation:Operation, typeName:string, parameters:ParameterObject[]) {
    const requestSchema = get(operation.route, 'requestBody.content["application/json"].schema')
    const aliasedType = requestSchema && requestSchema.$ref && getSchemaNameByRef(requestSchema.$ref)
    if (aliasedType) return `export type ${typeName} = ${aliasedType}`
    else return [
      `export interface ${typeName} {`,
        ...parameters.map(param => 
          `  ${param.name}: ${getSchemaName(param.schema as JSONSchema, param.name)}`),
      `}`
    ].join('\n')
  }
}
