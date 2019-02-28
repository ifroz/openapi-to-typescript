import 'source-map-support/register'

import { get, merge } from 'lodash'
import { Store } from './store'
import { InternalRefRewriter } from './refs'
import { eachOperation, Operation } from './operation'
import { RequestTypeFormatter, ResultTypeFormatter, SchemaFormatter } from './formatters'
import { OpenAPIObject } from './typings/openapi';
import { Formatter } from './formatter';

export interface GenerateTypingsOptions {
  operationFormatters?: Formatter<Operation>[]
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
    typeStore.assign(await new SchemaFormatter(schemaName).render(schemas[schemaName]))
  }

  const formatters:Formatter<Operation>[] = [
    new RequestTypeFormatter, 
    new ResultTypeFormatter, 
    ...operationFormatters
  ]

  const hasBoilerplate = (formatter: any) => 
    typeof (formatter as any).renderBoilerplate === 'function'
  for (let formatter of formatters.filter(hasBoilerplate) as any[])
    clientStore.assign({
      [formatters.indexOf(formatter)]: await formatter.renderBoilerplate(apiSchema)
    })

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
  for (const formatter of formatters) {
    typeStore.assign(await formatter.render(operation))
    if (typeof formatter.renderAction === 'function')
      clientStore.assign(await formatter.renderAction(operation))
  }
}