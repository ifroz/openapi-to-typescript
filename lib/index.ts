import 'source-map-support/register'

import { Store } from './store'
import { InternalRefRewriter } from './refs'
import { Operation } from './operation'
import { defaultOperationFormatters, SchemaFormatter } from './formatters'

export const GenerateTypings = async (parsedOpenAPISchema:OpenAPISchema):Promise<Store<string>> => {
  const { paths, components: { schemas }} = parsedOpenAPISchema
  const typeStore = new Store<string>()

  new InternalRefRewriter().rewrite(parsedOpenAPISchema.components.schemas)
  new InternalRefRewriter().rewrite(parsedOpenAPISchema.paths)

  for (const schemaName of Object.keys(schemas)) {
    typeStore.assign(await new SchemaFormatter(schemas[schemaName], schemaName).render())
  }

  for (const pathName of Object.keys(paths)) {
    for (const method of Object.keys(paths[pathName])) {
      const operation = new Operation(paths[pathName][method], { pathName, method })
      for (const Formatter of defaultOperationFormatters) {
        typeStore.assign(await new Formatter(operation).render())
      }
    }
  }

  return typeStore
}