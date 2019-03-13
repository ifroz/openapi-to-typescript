import fs from 'fs'
import yargs from 'yargs'
import { GenerateTypings } from '.'
import { FetchClientFormatter } from './formatters'

/* tslint:disable:no-console */
export default yargs
  .command('generate', 'Write generated output to a file', {}, async (argv) => {
    const generatedTypescript =
      await GenerateTypings(JSON.parse(fs.readFileSync(`${argv.input}`).toString()), {
        operationFormatters: [new FetchClientFormatter()],
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
  .option('verbose', {
    alias: 'v',
    default: false,
  })
  .argv
