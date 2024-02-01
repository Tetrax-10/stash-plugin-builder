import * as esbuild from "esbuild"

export interface BuildOptions {
    watch: boolean
    minify: boolean
    outDir?: string
    mainJsPath: string
    mainCssPath: string
}

export interface PluginBuildOptions extends BuildOptions {
    outDir: string
    settings: Settings
    esbuildOptions?: esbuild.BuildOptions
}

export interface Settings {
    id: string
    name: string
    version: string
    stashPluginDir?: string
    stashPluginSubDir?: string
    ui: {
        javascript?: string
        css?: string
        include?: string[]
        requires?: [
            {
                id: string
                source?: string
            }
        ]
    }
}

export interface SharedInterface {
    settings: Settings
    outDir: string
    dependencies: string[]
    crossSourceDependencies: object[]
}
