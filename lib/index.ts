import 'source-map-support/register'
import { InternalRefRewriter } from './refs'

type StringStore = { [key:string]:string }

export const GenerateTypes = async (parsedOpenAPISchema:OpenAPISchema):Promise<string> => {
  const typeStore:StringStore = {}

  new InternalRefRewriter().rewrite(parsedOpenAPISchema.components.schemas)
  new InternalRefRewriter().rewrite(parsedOpenAPISchema.paths)
  return `

  `
}