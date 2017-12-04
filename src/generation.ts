import {Application, Reflection, ReflectionKind} from "typedoc";
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import {} from "typedoc/dist/lib/models";
import {DeclarationReflection, SourceFile} from "typedoc/dist/lib/models";
import {ReflectionGroup} from "typedoc/dist/lib/models/ReflectionGroup";
import {CommentPlugin} from "typedoc/dist/lib/converter/plugins";
import {ClassInfo, DocGenerationConfig, DocInputData, ProjectConfig} from "./types";

function generatePath(newPath: string) {
  newPath.split('/').reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir)
    if (!fs.existsSync(curDir))
      fs.mkdirSync(curDir)

    return curDir
  }, '')
}

function getModuleName(fileName: string): string {
  return fileName.substr(0, fileName.length - 3)
}

function getGroup(groups: ReflectionGroup[], kindId: number) {
  const group = groups.filter(g => g.kind == kindId)[0]
  return group
    ? group.children as DeclarationReflection[]
    : []
}

// function getFunctions(groups:ReflectionGroup[]){
//   return getGroup(groups, ReflectionKind.Method)
// }

function filterPrivate(members: DeclarationReflection[]): DeclarationReflection[] {
  return members.filter(m => !m.flags.isPrivate)
}

function prepareClass(input: DeclarationReflection): ClassInfo {
  return {
    name: input.name,
    constructor: input.children.filter(c => c.kind == ReflectionKind.Constructor)[0],
    properties: filterPrivate(getGroup(input.groups, ReflectionKind.Property)),
    functions: filterPrivate(getGroup(input.groups, ReflectionKind.Method))
  }
}

// function prepareModule(file: SourceFile): Module {
//   const groups = file.groups
//
//   return {
//     name: getModuleName(file.fileName),
//     classes: getGroup(groups, ReflectionKind.Class).map(prepareClass),
//     interfaces: getGroup(groups, ReflectionKind.Interface).map(prepareClass),
//     functions: getGroup(groups, ReflectionKind.Function),
//   }
// }
//
// function prepareModules(files: SourceFile[]): Module[] {
//   return files.map(prepareModule)
// }
//
// // function filterSourceFiles(files: SourceFile[], use: string[]) {
// //   return files.filter(f => use.includes(getModuleName(f.fileName)))
// // }
//
// function prepareSource(src: DocInputData, config: ProjectConfig): DocOutputData {
//   // const files = filterSourceFiles(src.files, config.use)
//   const files = src.files
//   const modules = prepareModules(files)
//
//   return {
//     name: config.name,
//     modules: modules,
//   }
// }

function loadPartialTemplate(name: string) {
  const template = fs.readFileSync(__dirname + `/templates/partials/${name}.handlebars`, 'utf8')
  Handlebars.registerPartial(name, template)
}

function generateMarkdownFile(templateName: string, outputPath: string, data: any) {
  const template = fs.readFileSync(__dirname + `/templates/${templateName}.handlebars`, 'utf8')
  const documentation = Handlebars.compile(template)(data)
  fs.writeFileSync(outputPath, documentation)
}

type Hierarchy = string | any[]

function flatten<T>(input: T[]) {
  return [].concat.apply([], input)
}

function getHierarchy(rootDirectory: string, fileOrDirectory: string): Hierarchy {
  return fs.lstatSync(rootDirectory + '/' + fileOrDirectory).isDirectory()
    ? flatten(fs.readdirSync(rootDirectory + '/' + fileOrDirectory).map(f => getHierarchy(rootDirectory, fileOrDirectory + '/' + f)))
    : [fileOrDirectory]
}

function getRelativeHierarchy(directory: string): Hierarchy[] {
  return flatten(fs.readdirSync(directory).map(f => getHierarchy(directory, f)))
}

function getAbsoluteHierarchy(fileOrDirectory: string): string[] {
  if (!fs.lstatSync(fileOrDirectory).isDirectory())
    return [fileOrDirectory]

  const hierarchy = fs.readdirSync(fileOrDirectory).map(f => getAbsoluteHierarchy(fileOrDirectory + '/' + f))
  return flatten(hierarchy)
}

function copyHierarchy(files: Hierarchy, src: string, dist: string, data: any) {
  const fsExtra = require('fs-extra')
  for (let file of files) {
    if (path.extname(file) == '.handlebars') {
      const template = fs.readFileSync(src + '/' + file, 'utf8')
      const documentation = Handlebars.compile(template)(data)
      fs.writeFileSync(dist + '/' + file.replace('.handlebars', '.md'), documentation)
    }
    else {
      fsExtra.copySync(src + '/' + file, dist + '/' + file)
    }
  }
}

function flattenModuleChildren(modules: SourceFile[]) {
  const elements = flatten(modules.map(m => m.reflections))
  const result: any = {}
  for (let element of elements) {
    if (element.kind == ReflectionKind.Class) {
      result[element.name] = prepareClass(element)
    }
    else {
      result[element.name] = element
    }
  }
  return result
}

export function generateDocs(config: DocGenerationConfig) {
  const paths = config.paths

  const settings: any = {
    module: 'commonjs',
    excludeExternals: true
  }
  if (paths.tsconfig)
    settings.tsconfig = paths.tsconfig

  const app = new Application(settings)

  const sources = flatten(paths.src.map(getAbsoluteHierarchy))
    .filter((s: string) => path.extname(s) == '.ts' && s.indexOf('.d.ts') == -1 && s.indexOf('index.ts') == -1)

  const src = app.convert(sources)
  if (!src)
    throw new Error("Error parsing TypeScript source.")

  const partials = ['class', 'function', 'function_body', 'member', 'property', 'type']
  partials.forEach(loadPartialTemplate)
  // const data = prepareSource(src, config.project)

  const elements = flattenModuleChildren(src.files)
  generatePath(paths.output)

  const files = getRelativeHierarchy(paths.content)
  console.log(files)

  // Handlebars.registerHelper('class', function(options: any) {
  //   return new Handlebars.SafeString(
  //     ''
  //   )
  // })

  copyHierarchy(files, paths.content, paths.output, {elements: elements})
  // generateMarkdownFile('index', paths.output + '/index.md', data)
  //
  // for (let module of data.modules) {
  //   generateMarkdownFile('module', paths.output + `/${module.name}.md`, module)
  // }
}