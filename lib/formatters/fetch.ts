import { OperationFormatter } from '../formatter'
import { Store } from 'lib/store';

export class FetchClientFormatter extends OperationFormatter {
  static async renderBoilerplate() {
    return `const fetch = require('node-fetch')`
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
    const fetchWrapper = `const ${operationName} = async (payload: ${requestTypeName}):Promise<${responseTypeName}> => fetch({
      method: ${JSON.stringify(this.operation.method)},
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
