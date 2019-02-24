import 'source-map-support/register'
import { InternalRefRewriter } from './refs'
import { Operation } from './operation'
import { defaultOperationFormatters, SchemaFormatter } from './formatters'

type StringStore = { [key:string]:string }

export const GenerateTypings = async (parsedOpenAPISchema:OpenAPISchema):Promise<string> => {
  const { paths, components: { schemas }} = parsedOpenAPISchema
  const typeStore:StringStore = {}

  new InternalRefRewriter().rewrite(parsedOpenAPISchema.components.schemas)
  new InternalRefRewriter().rewrite(parsedOpenAPISchema.paths)

  for (const schemaName of Object.keys(schemas)) {
    Object.assign(typeStore, await new SchemaFormatter(schemas[schemaName], schemaName).render())
  }

  for (const pathName of Object.keys(paths)) {
    for (const method of Object.keys(paths[pathName])) {
      const operation = new Operation(paths[pathName][method], { pathName, method })
      for (const Formatter of defaultOperationFormatters) {
        Object.assign(typeStore, await new Formatter(operation).render())
      }
    }
  }

  return Object.values(typeStore).filter(t => t).join('\n')
}