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
function prepareClass(input) {
    return {
        name: input.name,
        properties: filterPrivate(getGroup(input.groups, typedoc_1.ReflectionKind.Property)),
        functions: filterPrivate(getGroup(input.groups, typedoc_1.ReflectionKind.Method))
    };
}
function prepareModule(file) {
    const groups = file.groups;
    return {
        name: getModuleName(file.fileName),
        classes: getGroup(groups, typedoc_1.ReflectionKind.Class).map(prepareClass),
        interfaces: getGroup(groups, typedoc_1.ReflectionKind.Interface).map(prepareClass),
        functions: getGroup(groups, typedoc_1.ReflectionKind.Function),
    };
}
function prepareModules(files) {
    return files.map(prepareModule);
}
// function filterSourceFiles(files: SourceFile[], use: string[]) {
//   return files.filter(f => use.includes(getModuleName(f.fileName)))
// }
function prepareSource(src, config) {
    // const files = filterSourceFiles(src.files, config.use)
    const files = src.files;
    const modules = prepareModules(files);
    return {
        name: config.name,
        modules: modules,
    };
}
function loadPartialTemplate(name) {
    const template = fs.readFileSync(__dirname + `/templates/partials/${name}.handlebars`, 'utf8');
    Handlebars.registerPartial(name, template);
}
function generateMarkdownFile(templateName, outputPath, data) {
    const template = fs.readFileSync(__dirname + `/templates/${templateName}.handlebars`, 'utf8');
    const documentation = Handlebars.compile(template)(data);
    fs.writeFileSync(outputPath, documentation);
}
function generateDocs(config) {
    const paths = config.paths;
    const app = new typedoc_1.Application({
        module: 'commonjs',
        excludeExternals: true,
        tsconfig: './tsconfig.json'
    });
    const src = app.convert(paths.inputs);
    if (!src)
        throw new Error("Could not generate documentation.");
    if (paths.temp) {
        generatePath(paths.temp);
        app.generateJson(src, paths.temp + '/doc.json');
    }
    const partials = ['class', 'function', 'member', 'property'];
    partials.forEach(loadPartialTemplate);
    const data = prepareSource(src, config.project);
    generatePath(paths.output);
    generateMarkdownFile('index', paths.output + '/index.md', data);
    for (let module of data.modules) {
        generateMarkdownFile('module', paths.output + `/${module.name}.md`, module);
    }
}
exports.generateDocs = generateDocs;
//# sourceMappingURL=generation.js.map