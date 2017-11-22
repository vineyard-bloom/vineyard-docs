import { SourceFile } from "typedoc/dist/lib/models";
export interface PathConfig {
    src: string[];
    content: string;
    output: string;
    tsconfig?: string;
}
export interface ProjectConfig {
    name: string;
    use?: string[];
}
export interface DocGenerationConfig {
    project: ProjectConfig;
    paths: PathConfig;
}
export interface DocInputData {
    files: SourceFile[];
}
