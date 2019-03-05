import fs from 'fs'
import yargs from 'yargs'
import { GenerateTypings } from '.'
import { FetchClientFormatter } from './formatters'

export default yargs
  .command('generate', 'Write generated output to a file', {}, async (argv) => {
    const { typeStore, clientStore } =
      await GenerateTypings(JSON.parse(fs.readFileSync(`${argv.input}`).toString()), {
        operationFormatters: [new FetchClientFormatter],
      })

    const outputFileWithoutExtension =
      `${argv.output === true ? argv.input : argv.output}`.replace(/(\.d)?\.ts$/, '')
    if (argv.output) {
      if (argv.typedefs) {
        fs.writeFileSync(`${outputFileWithoutExtension}.d.ts`, typeStore.toString())
        fs.writeFileSync(`${outputFileWithoutExtension}.ts`, clientStore.toString())
      } else {
        fs.writeFileSync(`${outputFileWithoutExtension}.ts`, [
          typeStore.toString(),
          clientStore.toString(),
        ].join('\n'))
      }
    } else {
      console.log(typeStore.toString())
      console.log(clientStore.toString())
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
  .option('typedefs', {
    alias: 'd',
    describe: 'Generate separate .d.ts file',
    default: false,
  })
  .option('verbose', {
    alias: 'v',
    default: false,
  })
  .argv
