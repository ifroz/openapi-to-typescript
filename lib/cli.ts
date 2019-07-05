import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { GenerateTypings } from '.'
import { EjsFormatter } from './formatters'

/* tslint:disable:no-console */
export default yargs
  .command(['generate', '$0'], 'Write generated output to a file', {}, async (argv) => {
    const apiSchema = JSON.parse(fs.readFileSync(`${argv.input}`).toString())
    const ejsPath = path.join(process.cwd(), `${argv.ejs}`)
    const ejs = fs.readFileSync(ejsPath).toString()
    const server: string|undefined = argv.server as any
    const generatedTypescript =
      await GenerateTypings(apiSchema, {
        operationFormatters: [
          new EjsFormatter(apiSchema, ejs, { server }),
        ],
      })

    const outputFileWithoutExtension =
      `${argv.output === true ? argv.input : argv.output}`.replace(/(\.d)?\.ts$/, '')
    if (argv.output) {
      fs.writeFileSync(`${outputFileWithoutExtension}.ts`, generatedTypescript)
    } else {
      console.log(generatedTypescript)
    }
  })
  .option('ejs', {
    describe: 'EJS template to use',
    default: './lib/formatters/fetch.ts.ejs',
  })
  .option('input', {
    demandOption: true,
    alias: 'i',
    describe: 'File to read from',
  })
  .option('output', {
    alias: 'o',
    describe: 'Output name to write to',
  })
  .option('server', {
    alias: 's',
    describe: 'Server URL to use (defaults to the first one in the OpenAPI spec)',
  })
  .option('verbose', {
    alias: 'v',
    default: false,
  })
  .argv
