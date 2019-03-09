import 'source-map-support/register'

import { get, merge } from 'lodash'
import { Formatter } from './formatter'
import { RequestTypeFormatter, ResultTypeFormatter, SchemaFormatter } from './formatters'
import { extractOperations, Operation } from './operation'
import { InternalRefRewriter } from './refs'
import { Store } from './store'
import { OpenAPIObject } from './typings/openapi'

export interface GenerateTypingsOptions {
  operationFormatters?: Formatter<Operation>[]
}

interface Stores {
  typeStore: Store<string>
  clientStore: Store<string>
}

export const GenerateTypings = async (
  apiSchema: OpenAPIObject,
  { operationFormatters = [] }: GenerateTypingsOptions = {},
): Promise<string> => {
  const schemas = merge({}, get(apiSchema, 'components.schemas'))
  const paths = merge({}, apiSchema.paths)
  const typeStore = new Store<string>()
  const clientStore = new Store<string>()
  const codeChunks: string[] = []

  new InternalRefRewriter().rewrite(schemas)
  new InternalRefRewriter().rewrite(paths)

  for (const schemaName of Object.keys(schemas)) {
    codeChunks.push(await new SchemaFormatter(schemaName).render(schemas[schemaName]))
  }

  const formatters: Formatter<Operation>[] = [
    new RequestTypeFormatter(),
    new ResultTypeFormatter(),
    ...operationFormatters,
  ]

  const hasBoilerplate = (formatter: any) =>
    typeof (formatter as any).renderBoilerplate === 'function'
  for (const formatter of formatters.filter(hasBoilerplate) as any[]) {
    codeChunks.push(await formatter.renderBoilerplate(apiSchema))
  }

  const operations = extractOperations(paths)
  for (const operation of operations) {
    for (const formatter of formatters) {
      codeChunks.push(await formatter.render(operation))
    }
  }

  return codeChunks.join('\n')
}