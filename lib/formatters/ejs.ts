import ejs from 'ejs'

import { Formatter } from '../formatter'
import { eachOperation, Operation } from '../operation'
import { OpenAPIObject } from '../typings/openapi'

export class EjsFormatter extends Formatter<Operation> {
  public readonly schema: OpenAPIObject
  public readonly template: ejs.TemplateFunction
  public readonly data: any

  constructor(schema: OpenAPIObject, ejsTemplate: string, data?: any) {
    super()
    this.schema = schema
    this.template = ejs.compile(ejsTemplate, {
      escape: JSON.stringify.bind(JSON),
    })
    this.data = data
  }

  public async renderToString(operations: Operation[]) {
    return this.template({
      server: ((this.schema.servers || [])[0] || {}).url,

      ...this.data,

      schema: this.schema,
      eachOperation,
    })
  }
}
