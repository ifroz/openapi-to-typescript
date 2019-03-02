
import { get } from 'lodash'
import { Formatter } from '../formatter'
import { OpenAPIObject, ParameterLocation } from '../typings/openapi';
import { Operation } from 'lib/operation';

const withoutIndentation = (s:string) => s.replace(/(\s*[\n]+)\s*/g, '\n').trim()
const withoutEmptyLines = (s:string) => s.replace(/\n+/g, '\n')

export class FetchClientFormatter extends Formatter<Operation> {
  url:string
  constructor({url}:any = {}) {
    super()
    this.url = url
  }
  async renderBoilerplate(apiSchema: OpenAPIObject) {
    const url = this.url || get(apiSchema, 'servers[0].url')
    return withoutIndentation(`
      const fetch = require('node-fetch')
      const pick = (obj:any, keys:string[]) => keys.reduce((picked, key) => obj[key] !== undefined ? Object.assign(picked, {[key]: obj[key]}) : picked, {})
      const substitutePath = (pathName:string, body:any) => pathName.split('/').map(dir => dir.startsWith('{') ? body[dir.slice(1,-1)] : dir).join('/')
      const encodeQuery = (obj:any, keys:string[]) => require('querystring').encode(pick(obj, keys))
      const API_URL = ${JSON.stringify(url)}
    `)
  }

  async render(operation:Operation) {
    const { operationTypeName, operationName, requestTypeName, responseTypeName } = this.names(operation)
    const typedef = `export type ${operationName} = (payload: ${requestTypeName}) => Promise<${responseTypeName}>;`
    return { [operationTypeName]: typedef }
  }

  async renderAction(operation:Operation) {
    const { operationName, requestTypeName, responseTypeName } = this.names(operation)
    const fetchWrapper = withoutEmptyLines(`const ${operationName} =
      async (body:${requestTypeName}, options:any):Promise<${responseTypeName}> => {
        return fetch(${this.urlSnippet(operation)}, {
          ...options,
          method: ${JSON.stringify(operation.method)},
          ${operation.route.requestBody ? 'body: JSON.stringify(body),' : ''}
        }).then((res:any) => res.json())
      }`)
    return { [operationName]: fetchWrapper }
  }

  private urlSnippet(operation:Operation) {
    const queryParameterNames = operation.parameterNamesIn('query')
    const endpointURL = operation.hasAnyParametersIn('path') ? 
      `API_URL + substitutePath(${JSON.stringify(operation.pathName)}, body)` :
      `API_URL`
    return queryParameterNames.length ? 
      `[${endpointURL}, encodeQuery(body, ${JSON.stringify(queryParameterNames)})].filter(x=>x).join('?')` :
      endpointURL
  }

  names(operation: Operation) {
    const operationName = operation.name
    const operationTypeName = operation.name + 'OperationType'
    const requestTypeName = operationName + 'Request'
    const responseTypeName = operationName + 'Result'
    return { operationName, operationTypeName, requestTypeName, responseTypeName }
  }
}
