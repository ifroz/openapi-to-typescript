import fs from 'fs'
import yargs from 'yargs'
import { GenerateTypings } from '.'
import { FetchClientFormatter } from './formatters'

/* tslint:disable:no-console */
export default yargs
  .command(['generate', '$0'], 'Write generated output to a file', {}, async (argv) => {
    const apiSchema = JSON.parse(fs.readFileSync(`${argv.input}`).toString())
    const serverUrl: string|undefined = argv.server as any
    const generatedTypescript =
      await GenerateTypings(apiSchema, {
        operationFormatters: [
          new FetchClientFormatter(apiSchema, {
            serverUrl,
          }),
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
