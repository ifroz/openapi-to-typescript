import { get, camelCase, upperFirst } from 'lodash'

interface RouteParameter {
  name: string
}
interface RouteObject {
  operationId?: string
  parameters: RouteParameter[]
}

export class Route {
  public readonly route:RouteObject
  public readonly name:string
  constructor(route: RouteObject, {pathName, method}:{
    pathName: string, 
    method: string
  }) {
    this.route = route
    this.name = upperFirst(camelCase(route.operationId || `${method} ${pathName}`))
  }

  requestParametersTypeDefinition():string {
    const lines: string[] = []
    for (const param of this.route.parameters || []) {
      lines.push(`  ${param.name}: any`)
    }
    const requestTypeName = `${this.name}Request`
    return lines.length ? [
      `export interface ${requestTypeName} {`,
      ...lines,
      `}`
    ].join('\n') : ``
  }

  get responseSchema()  {
    return get(this.route, "responses.200.content['application/json'].schema")
  }
}