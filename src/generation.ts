import {Application, ReflectionKind} from "typedoc";
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import {} from "typedoc/dist/lib/models";
import {DeclarationReflection, SourceFile} from "typedoc/dist/lib/models";
import {ReflectionGroup} from "typedoc/dist/lib/models/ReflectionGroup";
import {CommentPlugin} from "typedoc/dist/lib/converter/plugins";

export interface PathConfig {
  inputs: string[]
  temp: string
  output: string
}

export interface ProjectConfig {
  name: string
  use: string[]
}

export interface DocGenerationConfig {
  project: ProjectConfig
  paths: PathConfig
}

// interface FunctionInfo {
//   name: string
// }

interface ClassInfo {
  name: string
  functions: DeclarationReflection []
  properties: DeclarationReflection []
}

interface Module {
  name: string
  classes: ClassInfo[]
  interfaces: ClassInfo[]
  functions: DeclarationReflection[]
}

interface DocInputData {
  files: SourceFile[]
}

interface DocOutputData {
  name: string,
  modules: Module[]
}

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

function prepareClass(input: DeclarationReflection): ClassInfo {
  return {
    name: input.name,
    properties: getGroup(input.groups, ReflectionKind.Property),
    functions: getGroup(input.groups, ReflectionKind.Method)
  }
}

function prepareModule(file: SourceFile): Module {
  const groups = file.groups

  return {
    name: getModuleName(file.fileName),
    classes: getGroup(groups, ReflectionKind.Class).map(prepareClass),
    interfaces: getGroup(groups, ReflectionKind.Interface).map(prepareClass),
    functions: getGroup(groups, ReflectionKind.Function),
  }
}

function prepareModules(files: SourceFile[]): Module[] {
  return files.map(prepareModule)
}

function filterSourceFiles(files: SourceFile[], use: string[]) {
  return files.filter(f => use.includes(getModuleName(f.fileName)))
}

function prepareSource(src: DocInputData, config: ProjectConfig): DocOutputData {
  const files = filterSourceFiles(src.files, config.use)
  const modules = prepareModules(files)

  return {
    name: config.name,
    modules: modules,
  }
}

function loadPartialTemplate(name: string) {
  const template = fs.readFileSync(`src/templates/partials/${name}.handlebars`, 'utf8')
  Handlebars.registerPartial(name, template)
}

function generateMarkdownFile(templateName: string, outputPath: string, data: any) {
  const template = fs.readFileSync(`src/templates/${templateName}.handlebars`, 'utf8')
  const documentation = Handlebars.compile(template)(data)
  fs.writeFileSync(outputPath, documentation)
}

export function generateDocs(config: DocGenerationConfig) {
  const paths = config.paths

  const app = new Application({
    module: 'commonjs',
    excludeExternals: true,
  })

  const src = app.convert(paths.inputs)
  if (!src)
    throw new Error("Could not generate documentation.")

  generatePath(paths.temp)
  app.generateJson(src, paths.temp + '/doc.json')

  const partials = ['class', 'function', 'member', 'property']
  partials.forEach(loadPartialTemplate)
  const data = prepareSource(src, config.project)

  generatePath(paths.output)

  generateMarkdownFile('index', paths.output + '/index.md', data)

  for (let module of data.modules) {
    generateMarkdownFile('module', paths.output + `/${module.name}.md`, module)
  }
}