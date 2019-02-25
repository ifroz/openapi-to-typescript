import { OperationFormatter } from '../formatter'

export class FetchClientFormatter extends OperationFormatter {
  async render():Promise<{[k: string]: string}> {
    return {
      [this.operation.name]: this.renderActionType()
    }
  }
  
  renderActionType() {
    const operationName = this.operation.name
    const requestTypeName = operationName + 'Request'
    const responseTypeName = operationName + 'Result'
    return `export type ${operationName} = (payload: ${requestTypeName}) => Promise<${responseTypeName}>;`
  }
}
