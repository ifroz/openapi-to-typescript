import { camelCase, get } from 'lodash'

export class Route {
  public readonly route:any
  public readonly name:string
  constructor(route: any, {pathName, method}:{
    pathName: string, 
    method: string
  }) {
    this.route = route
    this.name = route.operationId || camelCase(`${method} ${pathName}`)
  }

  get responseSchema()  {
    return get(this.route, "responses.200.content['application/json'].schema")
  }
}