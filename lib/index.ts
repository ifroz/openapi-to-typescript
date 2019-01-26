import 'source-map-support/register'
import { InternalRefRewriter } from './refs'

interface OpenAPISchema {
  components: {
    schemas: any
  }
  paths: any
}

export const GenerateTypes = async (parsedOpenAPISchema:OpenAPISchema):Promise<string> => {
  new InternalRefRewriter().rewrite(parsedOpenAPISchema.components.schemas)
  new InternalRefRewriter().rewrite(parsedOpenAPISchema.paths)
  return `

  `
}