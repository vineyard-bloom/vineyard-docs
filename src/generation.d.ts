export interface PathConfig {
    inputs: string[];
    temp: string;
    output: string;
}
export interface ProjectConfig {
    name: string;
    use: string[];
}
export interface DocGenerationConfig {
    project: ProjectConfig;
    paths: PathConfig;
}
export declare function generateDocs(config: DocGenerationConfig): void;
