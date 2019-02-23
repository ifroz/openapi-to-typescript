import 'source-map-support/register'
import { InternalRefRewriter } from './refs'
import { compileSchema } from './compile'
import { get } from 'lodash'

type StringStore = { [key:string]:string }

export const GenerateTypes = async (parsedOpenAPISchema:OpenAPISchema):Promise<string> => {
  const { paths, components: { schemas }} = parsedOpenAPISchema
  const typeStore:StringStore = {}

  new InternalRefRewriter().rewrite(parsedOpenAPISchema.components.schemas)
  new InternalRefRewriter().rewrite(parsedOpenAPISchema.paths)

  for (const schemaName of Object.keys(schemas)) {
    typeStore[schemaName] = await compileSchema(schemas[schemaName], schemaName)
  }

  for (const pathName of Object.keys(paths)) {
    for (const method of Object.keys(paths[pathName])) {
      const route = new Route(paths[pathName][method])
      const resultTypeName = `${route.name}Result`
      typeStore[resultTypeName] =
        await compileSchema(route.responseSchema, resultTypeName)
    }
  }

  return Object.values(typeStore).filter(t => t).join('\n')
}

class Route {
  public readonly route:any
  public readonly name:string
  constructor(route: any) {
    this.route = route
    this.name = route.operationId || 'CannotNameThisAndNowWhat'
  }

  get responseSchema()  {
    return get(this.route, "responses.200.content['application/json'].schema")
  }
}