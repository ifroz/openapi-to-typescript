import { GenerateTypings } from '.'
import yargs from 'yargs'
import fs from 'fs'
import { FetchClientFormatter } from './formatters';

yargs
  .command('generate', 'Write generated output to a file', {}, async (argv) => {
    const { typeStore, clientStore } = 
      await GenerateTypings(JSON.parse(fs.readFileSync(`${argv.input}`).toString()), {
        operationFormatters: [FetchClientFormatter]
      })

    const outputFileWithoutExtension = 
      `${argv.output === true ? argv.input : argv.output}`.replace(/(\.d)?\.ts$/, '')
    if (argv) {
      if (argv.separateTypeDefinitions) {
        fs.writeFileSync(`${outputFileWithoutExtension}.d.ts`, typeStore.toString())
        fs.writeFileSync(`${outputFileWithoutExtension}.ts`, clientStore.toString())
      } else {
        fs.writeFileSync(`${outputFileWithoutExtension}.ts`, [
          typeStore.toString(), 
          clientStore.toString()
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
    default: false
  })
  .option('output', {
    alias: 'o',
    describe: 'Output name to write to'
  })
  .option('separateTypeDefinitions', {
    alias: 'd',
    describe: 'Generate separate .d.ts file',
    default: false
  })
  .option('verbose', {
    alias: 'v',
    default: false
  })
  .argv
