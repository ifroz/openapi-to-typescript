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
  parsedOpenAPISchema:OpenAPISchema, 
  { operationFormatters = [] }: GenerateTypingsOptions = {}
):Promise<Store<string>> => {
  const schemas = merge({}, parsedOpenAPISchema.components.schemas)
  const paths = merge({}, parsedOpenAPISchema.paths)
  const typeStore = new Store<string>()

  new InternalRefRewriter().rewrite(schemas)
  new InternalRefRewriter().rewrite(paths)

  for (const schemaName of Object.keys(schemas)) {
    typeStore.assign(await new SchemaFormatter(schemas[schemaName], schemaName).render())
  }

  for (const pathName of Object.keys(paths)) {
    for (const method of Object.keys(paths[pathName])) {
      const operation = new Operation(paths[pathName][method], { pathName, method })
      for (const OperationFormatter of [...defaultOperationFormatters, ...operationFormatters]) {
        typeStore.assign(await new OperationFormatter(operation).render())
      }
    }
  }

  return typeStore
}