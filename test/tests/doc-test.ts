import {generateDocs} from "../../src";

require('source-map-support').install()
import {assert} from 'chai'

const minute = 60 * 1000

describe('doc-test', function () {
  this.timeout(2 * minute)

  it('generates beautiful documentation', function () {
    generateDocs({
      project: {
        name: 'Vineyard Docs Test',
        use: ['main'],
      },
      paths: {
        src: ['test/res/src/main.ts'],
        content: 'test/content',
        output: 'test/temp/dist',
        diagrams: 'test/diagrams'
      }
    })
  })
})