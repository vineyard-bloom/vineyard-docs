# Vineyard Docs

Vineyard Docs generates Markdown documentation from TypeScript using TypeDoc and Handlebar templates. Tools for generating diagrams are also included.

## Installation and Setup

## Example Script

    require('source-map-support').install()
    import { generateDocs } from "vineyard-docs"

    generateDocs({
      project: {
        name: 'Project Documentation'
      },
      paths: {
        src: ['../src'],
        content: '../src/doc',
        output: '../doc',
        tsconfig: '../tsconfig.json',
      }
    })

## Example Handlebars Contents

    ### `enum` EnumName

    ### `interface` InterfaceName

    ### `function` functionName
    
