# Vineyard Docs

Vineyard Docs generates Markdown documentation from TypeScript using TypeDoc and Handlebars templates. Tools for generating diagrams using Graphviz also included.

## Installation

1. From the command line, navigate to the root of your Typescript project.

1. Run `npm install --save-dev vineyard-bloom/vineyard-docs#1.0.0-beta`

## Generating Documentation

1. Create `generate-docs.ts` somewhere in your project. 

1. Add the following to `generate-docs.ts`:

    ```
    require('source-map-support').install()
    import { generateDocs } from 'vineyard-docs'

    generateDocs({
      paths: {
        src: ['./src'],
        content: './src/doc',
        output: './doc',
        tsconfig: './tsconfig.json'
      }
    })
    ```

1. Customize your file paths.
    * `src` - location of the project's Typescript files, the files you want to document
    * `content` - location of Handlebars files used to generate documentation
    * `output` - where Markdown and graphics files will be output
    * `tsconfig` - the tsconfig file for the project

1. In the directory referenced in the `content` field, create a Handlebars file such as `documentation.handlebars`. Note that the file extension must be `.handlebars`. This Handlebars file will be used as the basis for generating your documentation.

1. Populate the Handlebars file. Within the file, you may use both Markdown and handlbars syntax. The following custom methods are available for automatically adding code references:

```
### `enum` Method
{{> enum elements.Method }}

### `interface` EndpointInfo
{{> interface elements.EndpointInfo }}

## Endpoint Functions

### createEndpoints
{{> function_body elements.createEndpoints }}
```


1. Multiple Handlebars files may be created. Each will output a corresponding Markdown file.

1. Run your script with `node genereate-docs.js`. Markdown files will be output to the directory specified in `generate-docs.ts`.

## Generating Diagrams

1. To generate diagrams, create the file `generate-diagrams.ts` somewhere in your project.

1. *Do some other stuff.*

1. Run your script with `node generate-diagrams.js`.

## Example `generate-docs.js`


## Example Handlebars File Contents
