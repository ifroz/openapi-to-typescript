import { get } from 'lodash'

import { JSONSchema } from 'json-schema-ref-parser'
import { getSchemaName, getSchemaNameByRef } from '../compile'
import { Formatter } from '../formatter'
import { Operation } from '../operation'
import { ParameterObject } from '../typings/openapi'

export class RequestTypeFormatter extends Formatter<Operation> {
  public async render(operation: Operation) {
    const typeName = `${operation.name}Request`
    const parameters = operation.operationObject.parameters || []
    return await this.toTypescriptInterface(operation, typeName, parameters as ParameterObject[])
  }

  public async toTypescriptInterface(operation: Operation, typeName: string, parameters: ParameterObject[]) {
    const requestSchema = get(operation.operationObject, 'requestBody.content["application/json"].schema')
    const aliasedType = requestSchema && requestSchema.$ref && getSchemaNameByRef(requestSchema.$ref)
    if (aliasedType) return `export type ${typeName} = ${aliasedType}`
    return [
      `export interface ${typeName} {`,
        ...parameters.map((param) =>
          `  ${param.name}: ${getSchemaName(param.schema as JSONSchema, param.name)}`),
      '}',
    ].join('\n')
  }
}
