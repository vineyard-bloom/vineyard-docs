import { Application, ReflectionKind } from "typedoc";
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import { DeclarationReflection, SourceFile } from "typedoc/dist/lib/models";
import { ReflectionGroup } from "typedoc/dist/lib/models/ReflectionGroup";
import { ClassInfo, DocGenerationConfig } from "./types";

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
    if (element.kind == ReflectionKind.Class || element.kind == ReflectionKind.Interface) {
      result[element.name] = prepareClass(element)
    }
    else {
      result[element.name] = element
    }
  }
  return result
}

export function processDiagrams(inputPath: string, outputPath: string) {
  const viz = require('viz.js')
  const files = fs.readdirSync(inputPath)
    .filter(f => !fs.lstatSync(inputPath + '/' + f).isDirectory())

  generatePath(outputPath)

  for (let file of files) {
    const inputContent = fs.readFileSync(inputPath + '/' + file, 'utf8')
    const outputContent = viz(inputContent, {
      format: 'svg',
      engine: 'dot',
    })
    fs.writeFileSync(outputPath + '/' + file.split('.')[0] + '.svg', outputContent)
  }
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
    .map((f: any) => path.resolve(f))

  const src = app.convert(sources)
  if (!src)
    throw new Error("Error parsing TypeScript source.")

  const partials = fs.readdirSync('src/templates/partials')
    .map(f => f.split('.')[0])// ['class', 'enum', 'function', 'function_body', 'interface', 'member', 'property', 'type']
  partials.forEach(loadPartialTemplate)

  const elements = flattenModuleChildren(src.files)
  generatePath(paths.output)

  const files = getRelativeHierarchy(paths.content)
  console.log(files)

  copyHierarchy(files, paths.content, paths.output, { elements: elements })

  if (typeof paths.diagrams === 'string')
    processDiagrams(paths.diagrams, paths.output + '/diagrams')
}