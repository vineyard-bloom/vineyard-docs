"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('source-map-support').install();
const vineyard_docs_1 = require("vineyard-docs");
vineyard_docs_1.generateDocs({
    project: {
        name: 'vineyard-docs Documentation'
    },
    paths: {
        src: ['../src'],
        content: '../src/doc',
        output: '../doc',
        tsconfig: '../tsconfig.json',
    }
});
//# sourceMappingURL=generate-docs.js.map