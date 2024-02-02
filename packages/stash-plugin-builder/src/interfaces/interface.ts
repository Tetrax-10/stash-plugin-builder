import * as esbuild from "esbuild"

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
            },
        ]
    }
    include?: string[]
}

export interface parsedArgs {
    minify: boolean
    watch: boolean
    outDir: string
    mainJsPath: string
    mainCssPath: string
}

export interface SharedInterface {
    args: parsedArgs
    settings: Settings
    pluginOutDir: string
    esbuildOptions: esbuild.BuildOptions
    dependencies: string[]
    crossSourceDependencies: object[]
}

export interface CompiledCode {
    js?: string[]
    css?: string[]
}
