export interface Answers {
    name: string
    id: string
    stashPluginDir: string
    boilerplate: string
    isPluginWithCss?: boolean
    isTypeScript?: boolean
    isReact?: boolean
    cssFramework?: string
}

export interface SharedInterface {
    projectDir: string
    ans: Answers
    jsExt: "js" | "ts" | "jsx" | "tsx"
    cssExt: "css" | "scss" | "sass" | "less" | "module.css" | "styl"
    mainCssPath: string
    devDependencies: string[]
}

export interface Settings {
    id: string
    name: string
    description: string
    version: string
    stashPluginSubDir: string
    ui: {
        javascript?: string
        css?: string
    }
}
