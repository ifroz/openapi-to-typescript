import { OperationFormatter } from '../formatter'

export class FetchClientFormatter extends OperationFormatter {
  async render():Promise<{[k: string]: string}> {
    const operationName = this.operation.name
    return {
      [operationName]: await this.renderActionType(this.operation.name)
    }
  }
  
  async renderActionType(operationName:string) {
    const requestTypeName = operationName + 'Request'
    const responseTypeName = operationName + 'Result'
    return `export type ${operationName} = (payload: ${requestTypeName}) => Promise<${responseTypeName}>;`
  }
}
