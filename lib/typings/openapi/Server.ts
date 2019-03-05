import * as oa from './OpenApi'

// Server & Server Variable

export class Server implements oa.ServerObject {
    public url: string
    public description?: string
    public variables: { [v: string]: ServerVariable }

    constructor(url: string, desc?: string) {
        this.url = url
        this.description = desc
        this.variables = {}
    }
    public addVariable(name: string, variable: ServerVariable) {
        this.variables[name] = variable
    }
}

export class ServerVariable implements oa.ServerVariableObject {
    public enum?: string[] | boolean[] | number[]
    public default: string | boolean | number
    public description?: string

    constructor(defaultValue: any,
                enums?: any,
                description?: string) {
        this.default = defaultValue
        this.enum = enums
        this.description = description
    }
}
