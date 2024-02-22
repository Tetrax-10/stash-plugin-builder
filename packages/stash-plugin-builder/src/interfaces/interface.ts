import * as esbuild from "esbuild"

export interface Settings {
    id: string
    name: string
    version: string
    stashPluginSubDir?: string
    ui: {
        javascript?: string
        css?: string
        include?: string[]
        requires?: [
            | {
                  id: string
                  source?: string
              }
            | string,
        ]
    }
    include?: string[]
    externalPath?: string[]
}

export interface parsedArgs {
    build: boolean
    minify: boolean
    watch: boolean
    inDir: string
    outDir: string
    mainJsPath: string
    mainCssPath: string
}

export interface SharedInterface {
    args: parsedArgs
    settings: Settings
    pluginInDir: string
    pluginOutDir: string
    stashPluginDir: string | undefined
    esbuildOptions: esbuild.BuildOptions
    dependencies: string[]
    crossSourceDependencies: object[]
}

export interface CompiledCode {
    js?: string[]
    css?: string[]
}
