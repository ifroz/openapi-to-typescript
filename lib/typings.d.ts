interface OpenAPISchema {
  components: {
    schemas: any
  }
  paths: any
  servers: Array<{
    url: string
  }>
}