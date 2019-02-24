import { Operation } from './operation'

export abstract class Formatter {
  abstract async render():Promise<{[k: string]: string}>
}

export abstract class OperationFormatter extends Formatter {
  protected readonly operation: Operation
  constructor(operation: Operation) {
    super()
    this.operation = operation
  }
}