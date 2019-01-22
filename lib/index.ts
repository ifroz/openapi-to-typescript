interface OpenAPISchema {
  components: {
    schemas: any
  }
  paths: any
}

export const GenerateTypes = async (parsedOpenAPISchema:OpenAPISchema):Promise<string> => {
  return `

  `
}