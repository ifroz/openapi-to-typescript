import { compile } from 'json-schema-to-typescript'

export const compileSchema = async (schema: OpenAPISchema, schemaName: string, scheme = 'internal') =>
  compile(schema, schemaName, {
    bannerComment: '',
    $refOptions: {
      resolve: {
        magic: {
          order: -100,
          canRead: new RegExp(`^${scheme}://`),
          read: magicReader,
        },
      },
    } as any,
  }).then(removeMagic)

const magicReader = (def: any, cb: any) => {
  const interfaceName = getSchemaNameByRef(def.url)
  cb(null, { type: 'string', enum: [`$magic$${interfaceName}`] })
}

const getSchemaNameByRef = (url: string) => {
  const objPath = url.substr(11).split('/')
  const interfaceName = objPath[objPath.length - 1]
  return interfaceName
}

const removeMagic = (line: string):string => 
  line.replace(/"\$magic\$[^"]+"/g, found => found.substr(8, found.length - 9))