import 'source-map-support/register'
import { InternalRefRewriter } from './refs'
import { compileSchema } from './compile'

type StringStore = { [key:string]:string }

export const GenerateTypes = async (parsedOpenAPISchema:OpenAPISchema):Promise<string> => {
  const { components: { schemas }} = parsedOpenAPISchema
  const typeStore:StringStore = {}

  new InternalRefRewriter().rewrite(parsedOpenAPISchema.components.schemas)
  new InternalRefRewriter().rewrite(parsedOpenAPISchema.paths)

  for (const schemaName of Object.keys(schemas)) {
    typeStore[schemaName] = await compileSchema(schemas[schemaName], schemaName)
  }

  return removeMagic(Object.values(typeStore).join('\n'))
}

function removeMagic(line: string):string {
  return line.replace(
    /"\$magic\$[^"]+"/g, 
    found => found.substr(8, found.length - 9))
}