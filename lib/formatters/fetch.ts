import { get } from 'lodash'
import { OperationFormatter } from '../formatter'

export class FetchClientFormatter extends OperationFormatter {
  static async renderBoilerplate(apiSchema: OpenAPISchema) {
    return [
      `const fetch = require('node-fetch')`,
      `const API_URL = ${JSON.stringify(get(apiSchema, 'servers[0].url'))}`
    ].join('\n')
  }

  async render():Promise<{[k: string]: string}> {
    const { operationTypeName } = this.names()
    return {
      [operationTypeName]: this.renderActionType(),
    }
  }
  
  renderActionType() {
    const { operationName, requestTypeName, responseTypeName } = this.names()
    return `export type ${operationName} = (payload: ${requestTypeName}) => Promise<${responseTypeName}>;`
  }

  async renderAction() {
    const { operationName, requestTypeName, responseTypeName } = this.names()
    const fetchWrapper = `const ${operationName} =
      async (body:${requestTypeName}, options:any):Promise<${responseTypeName}> =>
        fetch(API_URL, {
          ...options,
          method: ${JSON.stringify(this.operation.method)},
          body: JSON.stringify(body)
        }).then((res:any) => res.json())`
    return {
      [operationName]: fetchWrapper
    }
  }

  names() {
    const operationName = this.operation.name
    const operationTypeName = this.operation.name + 'OperationType'
    const requestTypeName = operationName + 'Request'
    const responseTypeName = operationName + 'Result'
    return { operationName, operationTypeName, requestTypeName, responseTypeName }
  }
}
