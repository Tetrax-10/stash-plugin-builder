import path from "path"

import Shared from "../shared/shared"
import { copy, createFolder, getAsset, getProjectPath, writeFile, writeYml } from "../utils/glob"
import { replaceContent } from "../utils/utils"
import { Settings } from "../interface/interface"

export function generateGitIgnore() {
    copy(getAsset("gitignore.txt", true), getProjectPath(".gitignore"), true)
}

export function generateGitAttributes() {
    writeFile(getProjectPath(".gitattributes"), "build.js linguist-vendored")
}

export function generatePackageJson() {
    writeFile(
        getProjectPath("package.json"),
        JSON.stringify(
            {
                name: Shared.ans.id.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
                version: "1.0",
                type: "module",
                scripts: {
                    build: "stash-plugin-builder",
                    "build-dist": "stash-plugin-builder --out=dist --minify",
                    watch: "stash-plugin-builder --watch",
                },
            },
            null,
            2
        )
    )
}

export function generateTSConfig() {
    if (!Shared.ans.isTypeScript) return

    writeFile(
        path.join(Shared.projectDir, "tsconfig.json"),
        JSON.stringify(
            {
                compilerOptions: {
                    target: "ES2022",
                    jsx: "react",
                    module: "ES2022",
                    moduleResolution: "Bundler",
                    resolveJsonModule: true,
                    outDir: "dist",
                    esModuleInterop: true,
                    forceConsistentCasingInFileNames: true,
                    strict: true,
                    skipLibCheck: true,
                },
                include: ["./src/**/*.*"],
            },
            null,
            2
        )
    )
}

export function generateIndexJs() {
    if (!Shared.ans.boilerplate.includes("JS")) return

    createFolder(getProjectPath("src"))

    Shared.jsExt = `${Shared.ans.isTypeScript ? "ts" : "js"}${Shared.ans.isReact ? "x" : ""}`

    let content = ""
    if (Shared.ans.isReact) {
        content = replaceContent(getAsset("js/index.txt"), ['import Button from "./components/Button/Button"\n\n', "Button()"])

        writeFile(getProjectPath(`src/components/Button/Button.${Shared.jsExt}`), getAsset("components/Button/Button.jsx").replace("css", Shared.cssExt))

        if (Shared.cssExt === "sass") {
            writeFile(getProjectPath("src/components/Button/Button.sass"), ".demo-button\n  background-color: red")
        } else {
            copy(getAsset("components/Button/Button.css", true), getProjectPath(`src/components/Button/Button.${Shared.cssExt}`), true)
        }

        Shared.devDependencies.push("@types/react")
    } else {
        content = replaceContent(getAsset("js/index.txt"), ["", '"Hello"'])
    }

    writeFile(getProjectPath(`src/index.${Shared.jsExt}`), content)
}

export function generateCss() {
    if (!Shared.ans.boilerplate.includes("CSS")) return

    let content = getAsset("css/main.css")
    if (Shared.ans.cssFramework === "SASS") {
        content = ".boilerplate-code\n  display: none"
    }

    Shared.mainCssPath = Shared.ans.isPluginWithCss ? "styles" : "theme"

    writeFile(getProjectPath(`${Shared.mainCssPath}/main.${Shared.cssExt}`), content)
}

export function generateSettings() {
    const settings: Settings = {
        id: Shared.ans.id,
        name: Shared.ans.name,
        description: "My plugin does awesome things",
        version: "1.0",
        stashPluginSubDir: "my-plugins-dev",
        ui: {},
    }

    if (Shared.ans.boilerplate.includes("JS")) {
        settings.ui.javascript = `./src/index.${Shared.jsExt}`
    }

    if (Shared.ans.boilerplate.includes("CSS")) {
        settings.ui.css = `./${Shared.mainCssPath}/main.${Shared.cssExt}`
    }

    writeYml(getProjectPath("settings.yml"), settings)
}

export function generateEnv() {
    writeFile(getProjectPath(".env"), `STASH_PLUGIN_DIR="${Shared.ans.stashPluginDir}"`)
}

export function generateWorkflow() {
    copy(getAsset("gh-build-workflow", true), getProjectPath(), true)
}

export function generateReadme() {
    copy(getAsset("README.md", true), getProjectPath())
}
