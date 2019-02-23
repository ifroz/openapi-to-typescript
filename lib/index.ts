import 'source-map-support/register'
import { InternalRefRewriter } from './refs'
import { compileSchema } from './compile'
import { RouteDefinition } from './route-definition'
import { RequestTypeFormatter, ResultTypeFormatter } from './formatters'

type StringStore = { [key:string]:string }

export const GenerateTypings = async (parsedOpenAPISchema:OpenAPISchema, {
  outputStrategies = [
    ResultTypeFormatter,
    RequestTypeFormatter,
  ]
}: any = {}):Promise<string> => {
  const { paths, components: { schemas }} = parsedOpenAPISchema
  const typeStore:StringStore = {}

  new InternalRefRewriter().rewrite(parsedOpenAPISchema.components.schemas)
  new InternalRefRewriter().rewrite(parsedOpenAPISchema.paths)

  for (const schemaName of Object.keys(schemas)) {
    typeStore[schemaName] = await compileSchema(schemas[schemaName], schemaName)
  }

  for (const pathName of Object.keys(paths)) {
    for (const method of Object.keys(paths[pathName])) {
      const route = new RouteDefinition(paths[pathName][method], { pathName, method })
      for (const Formatter of outputStrategies) {
        const formatted = new Formatter(route)
        typeStore[formatted.typeName] = await formatted.toTypescript()
      }
    }
  }

  return Object.values(typeStore).filter(t => t).join('\n')
}