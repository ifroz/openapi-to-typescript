
import { Operation } from 'lib/operation'
import { get } from 'lodash'
import { Formatter } from '../formatter'
import { OpenAPIObject, ParameterLocation } from '../typings/openapi'
import { type } from 'os';

const withoutIndentation = (s: string) => s.replace(/(\s*[\n]+)\s*/g, '\n').trim()
const withoutEmptyLines = (s: string) => s.replace(/\n+/g, '\n')

export class FetchClientFormatter extends Formatter<Operation> {
  public url: string
  constructor({url}: any = {}) {
    super()
    this.url = url
  }

  /* tslint:disable:max-line-length */
  public async renderBoilerplate(apiSchema?: OpenAPIObject) {
    const url = this.url || get(apiSchema, 'servers[0].url')
    return withoutIndentation(`
      const fetch = require('node-fetch')
      const pick = (obj:any, keys:string[]) => keys.reduce((picked, key) => obj[key] !== undefined ? Object.assign(picked, {[key]: obj[key]}) : picked, {})
      const substitutePath = (pathName:string, body:any) => pathName.split('/').map(dir => dir.startsWith('{') ? body[dir.slice(1,-1)] : dir).join('/')
      const encodeQuery = (obj:any, keys:string[]) => require('querystring').encode(pick(obj, keys))
      const API_URL = ${JSON.stringify(url)}
    `)
  }
  /* tslint:enable:max-line-length */

  public async render(operation: Operation) {
    const { operationName, requestTypeName, responseTypeName } = this.names(operation)
    const typedef = `export type ${operationName} = (payload: ${requestTypeName}) => Promise<${responseTypeName}>;`
    const fetchWrapper = withoutEmptyLines(`const ${operationName} =
      async (body:${requestTypeName}, options:any):Promise<${responseTypeName}> => {
        return fetch(${this.urlSnippet(operation)}, {
          ...options,
          method: ${JSON.stringify(operation.method)},
          ${operation.operationObject.requestBody ? 'body: JSON.stringify(body),' : ''}
        }).then((res:any) => res.json())
      }`)
    return `${typedef}\n${fetchWrapper}`
  }

  public names(operation: Operation) {
    const operationName = operation.name
    const operationTypeName = operation.name + 'OperationType'
    const requestTypeName = operationName + 'Request'
    const responseTypeName = operationName + 'Result'
    return { operationName, operationTypeName, requestTypeName, responseTypeName }
  }

  private urlSnippet(operation: Operation) {
    const queryParameterNames = operation.parameterNamesIn('query')
    const endpointURL = operation.hasAnyParametersIn('path') ?
      `API_URL + substitutePath(${JSON.stringify(operation.pathName)}, body)` :
      'API_URL'
    return queryParameterNames.length ?
      `[${endpointURL}, encodeQuery(body, ${JSON.stringify(queryParameterNames)})].filter(x=>x).join('?')` :
      endpointURL
  }
}
