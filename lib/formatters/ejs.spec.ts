import { OpenAPIObject } from '../typings/openapi'
import { EjsFormatter } from './ejs'

const schema: OpenAPIObject = Object.freeze({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Some API',
  },
  components: {
    schemas: {},
  },
  paths: {},
})

describe('EjsFormatter', () => {
  it('should work', async () => {
    const formatter = new EjsFormatter(schema, 'it <%- "works" %>')
    expect(await formatter.renderToString([])).toEqual('it works')
  })

  it('should JSON.stringify', async () => {
    const formatter = new EjsFormatter(schema, 'it <%= "stringifies" %>')
    expect(await formatter.renderToString([])).toEqual('it "stringifies"')
    expect(await formatter.renderToString([])).toContain('"')
  })
})
