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
function filterPrivate(members) {
    return members.filter(m => !m.flags.isPrivate);
}
function prepareClass(input) {
    return {
        name: input.name,
        constructor: input.children.filter(c => c.kind == typedoc_1.ReflectionKind.Constructor)[0],
        properties: filterPrivate(getGroup(input.groups, typedoc_1.ReflectionKind.Property)),
        functions: filterPrivate(getGroup(input.groups, typedoc_1.ReflectionKind.Method))
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
    const elements = flatten(modules.map(m => m.reflections));
    const result = {};
    for (let element of elements) {
        if (element.kind == typedoc_1.ReflectionKind.Class || element.kind == typedoc_1.ReflectionKind.Interface) {
            result[element.name] = prepareClass(element);
        }
        else {
            result[element.name] = element;
        }
    }
    return result;
}
function generateDiagrams(inputPath, outputPath) {
    const viz = require('viz.js');
    const files = fs.readdirSync(inputPath)
        .filter(f => !fs.lstatSync(inputPath + '/' + f).isDirectory());
    generatePath(outputPath);
    for (let file of files) {
        const inputContent = fs.readFileSync(inputPath + '/' + file, 'utf8');
        const outputContent = viz(inputContent, {
            format: 'svg',
            engine: 'dot',
        });
        fs.writeFileSync(outputPath + '/' + file.split('.')[0] + '.svg', outputContent);
    }
}
exports.generateDiagrams = generateDiagrams;
function loadSourceCode(config) {
    if (!config.paths.src)
        return {};
    const settings = {
        module: 'commonjs',
        excludeExternals: true,
        ignoreCompilerErrors: true,
    };
    const sources = flatten(config.paths.src.map(getAbsoluteHierarchy))
        .filter((s) => path.extname(s) == '.ts' && s.indexOf('.d.ts') == -1 && s.indexOf('index.ts') == -1)
        .map((f) => path.resolve(f));
    const app = new typedoc_1.Application(settings);
    const src = app.convert(sources);
    if (!src)
        throw new Error("Error parsing TypeScript source.");
    const partials = fs.readdirSync('src/templates/partials')
        .map(f => f.split('.')[0]); // ['class', 'enum', 'function', 'function_body', 'interface', 'member', 'property', 'type']
    partials.forEach(loadPartialTemplate);
    return flattenModuleChildren(src.files);
}
exports.loadSourceCode = loadSourceCode;
function generateDocs(config) {
    const paths = config.paths;
    const elements = loadSourceCode(config);
    generatePath(paths.output);
    const files = getRelativeHierarchy(paths.content);
    console.log(files);
    copyHierarchy(files, paths.content, paths.output, { elements: elements });
    if (typeof paths.diagrams === 'string')
        generateDiagrams(paths.diagrams, paths.output + '/diagrams');
}
exports.generateDocs = generateDocs;
//# sourceMappingURL=generation.js.map