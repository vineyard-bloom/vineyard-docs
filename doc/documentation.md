# Vineyard Docs

Vineyard Docs generates Markdown documentation from TypeScript using TypeDoc and Handlebars templates and generates diagrams using Graphviz.

## Installation

1. From the command line, navigate to the root of your TypeScript project.

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

1. Customize your paths.
    * `src` - source folder for the project's TypeScript files, the files you want to document
    * `content` - source folder for Handlebars files used to generate documentation
    * `output` - destination folder where Markdown files will be output
    * `tsconfig` - the tsconfig file for the project

1. In the directory referenced in the `content` field, create a Handlebars file such as `documentation.handlebars`. Note that the file extension must be `.handlebars`. This Handlebars file will be used as the basis for generating your documentation.

1. Add content to the Handlebars file. Both Handlebars and Markdown syntax may be used. See **Customizing Documentation** below.

1. Multiple Handlebars files may be created as desired for further organization. Each will output a corresponding Markdown file.

1. Run your script with `node generate-docs.js` (note that this is the transpiled JavaScript file). Markdown files will be output to the directory specified earlier in the `output` field.

### Customizing Documentation

* Regular Markdown syntax may be used within the Handlebars files. It will be output as-is to generated Markdown files.

* Within the Handlebars files, the following custom methods are available for automatically adding code references. Additional information about each will be added to the Markdown file.

    ```
    {{> class elements.YourClassName }}

    {{> interface elements.YourInterfaceName }}

    {{> enum elements.YourEnumName }}

    {{> function elements.yourFunctionName }}

    {{> function_body elements.yourFunctionName }}
    ```

* Within TypeScript source files, comments added within a class definition will be included in the Markdown file when using `{{> class elements.YourclassName }}`. Comments must be in the following format:

    ```
    /**
    * Comment
    */
    ```

* Within comments, the following JavaDoc tags may be used for further customization (courtesy of [Typedoc](http://typedoc.org/guides/doccomments/)):

  * `@param <param name>` - documents a parameter for the subsequent method
  * `@return(s)` - documents the return of the subsequent method
  * `@event` - documents events triggered by the subsequent method
  * `@hidden and @ignore` - keeps the subsequent code from being documented

## Generating Diagrams

1. Create `generate-diagrams.ts` somewhere in your project.

1. Add the following to `generate-diagrams.ts`:

    ```
    import { generateDiagrams } from 'vineyard-docs'

    generateDiagrams('src/diagrams', 'content/diagrams')
    ```

1. Customize your paths.
    * First parameter - source folder for Graphviz files
    * Second parameter - destination folder for SVG files to be output

1. In the directory referenced as the first parameter in `generateDiagrams`, create a Graphviz file such as `graphic.gv`. This Graphviz file will be used as the basis for generating your graphic.

1. Add content to the Graphviz file. See **Customizing Graphics** below.

1. Multiple Graphviz files may be created. Each will output a corresponding SVG file.

1. Run your script with `node generate-diagrams.js` (note that this is the transpiled JavaScript file). SVG files will be output to the directory specified earlier as the second parameter of `generateDiagrams`.

### Customizing Graphics

* Here is an example of the basic syntax for generating graphics in Graphviz files, along with the corresponding graphic output.

    ```
    digraph G {

      subgraph cluster_0 {
        style=filled;
        color=lightgrey;
        node [style=filled,color=white];
        a0 -> a1 -> a2 -> a3;
        label = "process #1";
      }

      subgraph cluster_1 {
        node [style=filled];
        b0 -> b1 -> b2 -> b3;
        label = "process #2";
        color=blue
      }

      start -> a0;
      start -> b0;
      a1 -> b3;
      b2 -> a3;
      a3 -> a0;
      a3 -> end;
      b3 -> end;

      start [shape=Mdiamond];
      end [shape=Msquare];

    }
    ```

![graphic](https://user-images.githubusercontent.com/31632938/40144578-5efc4c80-591c-11e8-9194-55417e68c647.png)

* If you want to experiment with the above code, check out this realtime [Graphviz editor](https://dreampuf.github.io/GraphvizOnline/).

* For further customization, see the [Graphviz Documentation](https://graphviz.gitlab.io/documentation/).
