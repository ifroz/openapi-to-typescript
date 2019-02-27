import 'source-map-support/register'

import { merge } from 'lodash'
import { Store } from './store'
import { InternalRefRewriter } from './refs'
import { Operation } from './operation'
import { defaultOperationFormatters, SchemaFormatter } from './formatters'

export interface GenerateTypingsOptions {
  operationFormatters?: any[]
}

export const GenerateTypings = async (
  apiSchema:OpenAPISchema, 
  { operationFormatters = [] }: GenerateTypingsOptions = {}
):Promise<{ [k: string]: Store<string> }> => {
  const schemas = merge({}, apiSchema.components.schemas)
  const paths = merge({}, apiSchema.paths)
  const typeStore = new Store<string>()
  const clientStore = new Store<string>()

  new InternalRefRewriter().rewrite(schemas)
  new InternalRefRewriter().rewrite(paths)

  for (const schemaName of Object.keys(schemas)) {
    typeStore.assign(await new SchemaFormatter(schemas[schemaName], schemaName).render())
  }

  const formatters = [...defaultOperationFormatters, ...operationFormatters]
  for (let formatter of formatters) {
    if (typeof formatter.renderBoilerplate === 'function') {
      clientStore.assign({
        [formatters.indexOf(formatter)]: await formatter.renderBoilerplate(apiSchema)
      })
    }
  }
  for (const pathName of Object.keys(paths)) {
    for (const method of Object.keys(paths[pathName])) {
      const operation = new Operation(paths[pathName][method], { pathName, method })
      for (const OperationFormatter of formatters) {
        const formatter = new OperationFormatter(operation)
        typeStore.assign(await formatter.render())
        if (typeof formatter.renderAction === 'function')
          clientStore.assign(await formatter.renderAction())
      }
    }
  }

  return {
    typeStore,
    clientStore,
  }
}