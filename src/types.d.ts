import { DeclarationReflection, SourceFile } from "typedoc/dist/lib/models";
export interface PathConfig {
    src?: string[];
    content: string;
    output: string;
    tsconfig?: string;
}
export interface ProjectConfig {
    name: string;
    use?: string[];
}
export interface DocGenerationConfig {
    paths: PathConfig;
}
export interface ClassInfo {
    name: string;
    constructor: DeclarationReflection;
    functions: DeclarationReflection[];
    properties: DeclarationReflection[];
}
export interface DocInputData {
    files: SourceFile[];
}
