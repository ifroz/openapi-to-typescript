import { get } from 'lodash'
import { Formatter } from '../formatter'
import { OpenAPIObject } from '../typings/openapi';
import { Operation } from 'lib/operation';

export class FetchClientFormatter extends Formatter<Operation> {
  async renderBoilerplate(apiSchema: OpenAPIObject) {
    return [
      `const fetch = require('node-fetch')`,
      `const pick = (obj:any, keys:string[]) => keys.reduce((picked, key) => obj[key] !== undefined ? Object.assign(picked, {[key]: obj[key]}) : picked, {})`,
      `const encodeQuery = (obj:any, keys:string[]) => require('querystring').encode(pick(obj, keys))`,
      `const API_URL = ${JSON.stringify(get(apiSchema, 'servers[0].url'))}`,
    ].join('\n')
  }

  async render(operation:Operation) {
    const { operationTypeName } = this.names(operation)
    return {
      [operationTypeName]: this.renderActionType(operation),
    }
  }
  
  renderActionType(operation:Operation) {
    const { operationName, requestTypeName, responseTypeName } = this.names(operation)
    return `export type ${operationName} = (payload: ${requestTypeName}) => Promise<${responseTypeName}>;`
  }

  async renderAction(operation:Operation) {
    const { operationName, requestTypeName, responseTypeName } = this.names(operation)
    const queryParameterNames =
      operation.route.parameters
        .filter(param => param.in === 'query')
        .map(param => param.name)

    const urlCode = queryParameterNames.length ? 
      `[API_URL, encodeQuery(body, ${JSON.stringify(queryParameterNames)})].filter(x=>x).join('?')` :
      'API_URL'
    const fetchWrapper = `const ${operationName} =
      async (body:${requestTypeName}, options:any):Promise<${responseTypeName}> => {
        return fetch(${urlCode}, {
          ...options,
          method: ${JSON.stringify(operation.method)},
          body: JSON.stringify(body)
        }).then((res:any) => res.json())
      }`
    return {
      [operationName]: fetchWrapper
    }
  }

  names(operation: Operation) {
    const operationName = operation.name
    const operationTypeName = operation.name + 'OperationType'
    const requestTypeName = operationName + 'Request'
    const responseTypeName = operationName + 'Result'
    return { operationName, operationTypeName, requestTypeName, responseTypeName }
  }
}
