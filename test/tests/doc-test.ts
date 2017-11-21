import {generateDocs} from "../../src/generation";

require('source-map-support').install()
import {assert} from 'chai'

describe('doc-test', function () {
  this.timeout(15000)

  it('generates beautiful documentation', function () {
    generateDocs({
      project: {
        name: 'Vineyard Docs Test',
        use: ['main'],
      },
      paths: {
        inputs: ['test/res/src/main.ts'],
        temp: 'test/temp/temp',
        output: 'test/temp/dist',
      }
    })
  })
})