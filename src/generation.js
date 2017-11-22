"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typedoc_1 = require("typedoc");
const fs = require("fs");
const Handlebars = require("handlebars");
const path = require("path");
function generatePath(newPath) {
    newPath.split('/').reduce((parentDir, childDir) => {
        const curDir = path.resolve(parentDir, childDir);
        if (!fs.existsSync(curDir))
            fs.mkdirSync(curDir);
        return curDir;
    }, '');
}
function getModuleName(fileName) {
    return fileName.substr(0, fileName.length - 3);
}
function getGroup(groups, kindId) {
    const group = groups.filter(g => g.kind == kindId)[0];
    return group
        ? group.children
        : [];
}
// function getFunctions(groups:ReflectionGroup[]){
//   return getGroup(groups, ReflectionKind.Method)
// }
function filterPrivate(members) {
    return members.filter(m => !m.flags.isPrivate);
}
// function prepareClass(input: DeclarationReflection): ClassInfo {
//   return {
//     name: input.name,
//     properties: filterPrivate(getGroup(input.groups, ReflectionKind.Property)),
//     functions: filterPrivate(getGroup(input.groups, ReflectionKind.Method))
//   }
// }
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
function loadPartialTemplate(name) {
    const template = fs.readFileSync(__dirname + `/templates/partials/${name}.handlebars`, 'utf8');
    Handlebars.registerPartial(name, template);
}
function generateMarkdownFile(templateName, outputPath, data) {
    const template = fs.readFileSync(__dirname + `/templates/${templateName}.handlebars`, 'utf8');
    const documentation = Handlebars.compile(template)(data);
    fs.writeFileSync(outputPath, documentation);
}
function flatten(input) {
    return [].concat.apply([], input);
}
function getHierarchy(rootDirectory, fileOrDirectory) {
    return fs.lstatSync(rootDirectory + '/' + fileOrDirectory).isDirectory()
        ? flatten(fs.readdirSync(rootDirectory + '/' + fileOrDirectory).map(f => getHierarchy(rootDirectory, fileOrDirectory + '/' + f)))
        : [fileOrDirectory];
}
function getRelativeHierarchy(directory) {
    return flatten(fs.readdirSync(directory).map(f => getHierarchy(directory, f)));
}
function getAbsoluteHierarchy(fileOrDirectory) {
    if (!fs.lstatSync(fileOrDirectory).isDirectory())
        return [fileOrDirectory];
    const hierarchy = fs.readdirSync(fileOrDirectory).map(f => getAbsoluteHierarchy(fileOrDirectory + '/' + f));
    return flatten(hierarchy);
}
function copyHierarchy(files, src, dist, data) {
    const fsExtra = require('fs-extra');
    for (let file of files) {
        if (path.extname(file) == '.handlebars') {
            const template = fs.readFileSync(src + '/' + file, 'utf8');
            const documentation = Handlebars.compile(template)(data);
            fs.writeFileSync(dist + '/' + file.replace('.handlebars', '.md'), documentation);
        }
        else {
            fsExtra.copySync(src + '/' + file, dist + '/' + file);
        }
    }
}
function flattenModuleChildren(modules) {
    return flatten(modules.map(m => m.reflections));
}
function generateDocs(config) {
    const paths = config.paths;
    const settings = {
        module: 'commonjs',
        excludeExternals: true
    };
    if (paths.tsconfig)
        settings.tsconfig = paths.tsconfig;
    const app = new typedoc_1.Application(settings);
    const sources = flatten(paths.src.map(getAbsoluteHierarchy))
        .filter((s) => path.extname(s) == '.ts');
    const src = app.convert(sources);
    if (!src)
        throw new Error("Error parsing TypeScript source.");
    const partials = ['class', 'function', 'member', 'property'];
    partials.forEach(loadPartialTemplate);
    // const data = prepareSource(src, config.project)
    const elements = flattenModuleChildren(src.files);
    generatePath(paths.output);
    const files = getRelativeHierarchy(paths.content);
    console.log(files);
    Handlebars.registerHelper('class', function (options) {
        return new Handlebars.SafeString('');
    });
    copyHierarchy(files, paths.content, paths.output, elements);
    // generateMarkdownFile('index', paths.output + '/index.md', data)
    //
    // for (let module of data.modules) {
    //   generateMarkdownFile('module', paths.output + `/${module.name}.md`, module)
    // }
}
exports.generateDocs = generateDocs;
//# sourceMappingURL=generation.js.map