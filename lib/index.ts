import 'source-map-support/register'

import { get, merge } from 'lodash'
import { Store } from './store'
import { InternalRefRewriter } from './refs'
import { eachOperation, Operation } from './operation'
import { RequestTypeFormatter, ResultTypeFormatter, SchemaFormatter } from './formatters'
import { OpenAPIObject } from './typings/openapi';

export interface GenerateTypingsOptions {
  operationFormatters?: any[]
}

interface Stores {
  typeStore: Store<string>
  clientStore: Store<string>
}

export const GenerateTypings = async (
  apiSchema:OpenAPIObject, 
  { operationFormatters = [] }: GenerateTypingsOptions = {}
):Promise<Stores> => {
  const schemas = merge({}, get(apiSchema, 'components.schemas'))
  const paths = merge({}, apiSchema.paths)
  const typeStore = new Store<string>()
  const clientStore = new Store<string>()
  const stores = { typeStore, clientStore }

  new InternalRefRewriter().rewrite(schemas)
  new InternalRefRewriter().rewrite(paths)

  for (const schemaName of Object.keys(schemas)) {
    typeStore.assign(await new SchemaFormatter(schemas[schemaName], schemaName).render())
  }

  const formatters = [
    RequestTypeFormatter, 
    ResultTypeFormatter, 
    ...operationFormatters
  ]
  for (let formatter of formatters) {
    if (typeof formatter.renderBoilerplate === 'function') {
      clientStore.assign({
        [formatters.indexOf(formatter)]: await formatter.renderBoilerplate(apiSchema)
      })
    }
  }
  for (const operation of eachOperation(paths)) {
    await applyFormatters(operation, formatters, stores)
  }

  return stores
}

async function applyFormatters(
  operation:Operation, 
  formatters: any[], 
  { typeStore, clientStore }:Stores
) {
  for (const OperationFormatter of formatters) {
    const formatter = new OperationFormatter()
    typeStore.assign(await formatter.render(operation))
    if (typeof formatter.renderAction === 'function')
      clientStore.assign(await formatter.renderAction(operation))
  }
}