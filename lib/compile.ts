import { JSONSchema } from 'json-schema-ref-parser'
import { compile } from 'json-schema-to-typescript'
import { get } from 'lodash'
import { INTERNAL_SCHEME } from './refs'

export const compileSchema = async (schema: JSONSchema, schemaName: string) =>
  compile(schema as any, schemaName, {
    bannerComment: '',
    $refOptions: {
      resolve: {
        magic: {
          order: -100,
          canRead: new RegExp(`^${INTERNAL_SCHEME}://`),
          read: magicReader,
        },
      },
    } as any,
  }).then(removeMagic)

const magicReader = (def: any, cb: any) => {
  const interfaceName = getSchemaNameByRef(def.url)
  cb(null, { type: 'string', enum: [`$magic$${interfaceName}`] })
}

export const getSchemaNameByRef = (url: string) => {
  const objPath = url.substr(`${INTERNAL_SCHEME}:/`.length).split('/')
  const interfaceName = objPath[objPath.length - 1]
  return interfaceName
}

const removeMagic = (line: string): string =>
  line.replace(/"\$magic\$[^"]+"/g, (found) => found.substr(8, found.length - 9))

export function getSchemaName(schema: JSONSchema, schemaName: string) {
  if (schema.$ref) {
    return getSchemaNameByRef(schema.$ref)
  } else {
    switch (schema.type) {
      case 'object':
        // function compileSchemaAndReturnName(schema: JSONSchema, schemaName: string) {}
        return schemaName
      case 'array':
        return get(schema.items, 'type', 'any') + '[]'
      case 'integer':
        return 'number'
      default:
        return schema.type || 'never'
    }
  }
}
