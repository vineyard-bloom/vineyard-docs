"use strict";
// require('source-map-support').install()
// import {generateDocs} from "./generation"
//
// function run(args: string[]) {
//   const program = require('commander')
//
//   const packageInfo = require('../package.json')
//
//   program
//     .version(packageInfo.version)
//     .option('-i, --input', 'Input source directory')
//     .option('-o, --output', 'Output directory')
//     .option('-t, --title', 'Main title of the documentation')
//     .parse(args)
//
//     for (let option of [ 'input', 'output', 'title']) {
//     if (!program[option]) {
//       console.error(`Missing --${option} setting`)
//       return
//     }
//   }
//
//   generateDocs({
//     project: {
//       name: program.title,
//       use: ['main'],
//     },
//     paths: {
//       inputs: ['test/res/src/main.ts'],
//       temp: 'test/temp/temp',
//       output: 'test/temp/dist',
//     }
//   })
// }
//
// run(process.argv) 
//# sourceMappingURL=cli.js.map