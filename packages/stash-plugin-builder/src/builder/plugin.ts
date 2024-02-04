import path from "path"
import chalk from "chalk"
import * as esbuild from "esbuild"

import Shared from "../shared/shared"
import buildPluginYml from "./yml"
import { isJs, replaceContent } from "../utils/utils"
import { buildExternalFiles } from "./externalFiles"
import { initReloadServer, webSocketData } from "../helpers/reloadServer"
import { createFolder, fsExsists, writeFile, deleteFile, getAsset, unixPath, getBuildPath, getTempPath, getFileContents } from "../utils/glob"

import { CompiledCode } from "../interfaces/interface"

export default async function buildPlugin() {
    const compiledJsPath = getBuildPath(`${Shared.settings.id}.js`)
    const compiledCssPath = getBuildPath(`${Shared.settings.id}.css`)

    const tempPath = getTempPath()
    const tempIndexJsPath = getTempPath("index.js")

    const esbuildEntryPoints: string[] = []

    const mainJsAbsolutePath = Shared.settings.ui.javascript ? unixPath(path.resolve(Shared.settings.ui.javascript)) : ""

    const isProcessJS = mainJsAbsolutePath && fsExsists(mainJsAbsolutePath)
    const isProcessCss = Shared.settings.ui.css && fsExsists(Shared.settings.ui.css)

    deleteFile(tempPath)
    createFolder(tempPath)

    // add main js to esbuild entry points
    if (isProcessJS) {
        writeFile(tempIndexJsPath, replaceContent(getAsset("pluginWrapper.js"), [mainJsAbsolutePath]))
        esbuildEntryPoints.push(tempIndexJsPath)
    }

    // add main css to esbuild entry points
    // @ts-expect-error skip
    if (isProcessCss) esbuildEntryPoints.push(Shared.settings.ui.css)

    // add ui include files to esbuild entry point
    if (typeof Shared.settings.ui.include === "object" && Shared.settings.ui.include?.length) {
        const availableIncludes = fsExsists(Shared.settings.ui.include)
        if (typeof availableIncludes === "object" && availableIncludes.length) {
            for (const _path of availableIncludes) {
                let filePath = _path
                if (isJs(_path)) {
                    filePath = getTempPath(path.basename(_path))
                    writeFile(filePath, replaceContent(getAsset("wrapper.js"), [getFileContents(_path)]))
                }
                esbuildEntryPoints.push(filePath)
            }
        }
    }

    // filter cross-source dependencies
    if (Shared.settings.ui.requires?.length) {
        for (const plugin of Shared.settings.ui.requires) {
            if (plugin.source) {
                Shared.crossSourceDependencies.push(plugin)
            } else {
                Shared.dependencies.push(plugin.id)
            }
        }

        // add esbuild entry point for dependencyInstaller.js
        if (Shared.crossSourceDependencies.length) {
            const dependencyInstallerPath = getTempPath("dependencyInstaller.js")
            const dependencyInstallerContent = replaceContent(getAsset("dependencyInstaller.js"), [JSON.stringify(Shared.crossSourceDependencies)])
            writeFile(dependencyInstallerPath, dependencyInstallerContent)

            esbuildEntryPoints.push(dependencyInstallerPath)
        }
    }

    const esbuildOptions = {
        entryPoints: esbuildEntryPoints,
        outdir: Shared.pluginOutDir,
        minify: Shared.args.minify,
        write: false,
        ...Shared.esbuildOptions,
    }

    async function afterBundle(result: esbuild.BuildResult) {
        // get organized object of compiled js and css
        const compiledCode = result.outputFiles?.reduce((acc: CompiledCode, item: esbuild.OutputFile) => {
            const extension = path.extname(item.path)

            if (extension === ".js") {
                acc.js = acc.js || []
                acc.js.push(item.text)
            } else if (extension === ".css") {
                acc.css = acc.css || []
                acc.css.push(item.text)
            }

            return acc
        }, {})

        // write all js contents
        if (compiledCode?.js?.length) {
            let FinalCompiledJs = ""
            compiledCode.js.forEach((compiledJs: string) => {
                compiledJs = Shared.args.minify ? compiledJs.trim() : compiledJs
                FinalCompiledJs += compiledJs + "\n"
            })
            writeFile(compiledJsPath, replaceContent(getAsset("wrapper.js"), [FinalCompiledJs.trim()]))
        }

        // write all css contents
        if (compiledCode?.css?.length) {
            compiledCode.css.forEach((compiledCss: string, index: number) => {
                compiledCss = Shared.args.minify ? compiledCss.trim() : compiledCss
                writeFile(compiledCssPath, compiledCss, index === 0 ? false : true)
            })
        }

        // builds yml file for the plugin
        buildPluginYml(compiledCode?.js?.length, compiledCode?.css?.length)
        buildExternalFiles()

        console.log(chalk.green(`${Shared.settings.name} built ✅`))

        // tells stash-plugin-builder's reload client to reload the stash website
        if (Shared.args.watch && webSocketData.socket?.send) {
            webSocketData.socket.send("reload")
        } else if (webSocketData.connected) {
            console.log(chalk.red("reload-server: connection lost to stash website! ❌"))
            console.log(chalk.blue("reload-server: reload stash website to re-connect 🔄️"))
            webSocketData.connected = false
        }
    }

    // initialize reload server
    if (Shared.args.watch && Shared.stashPluginDir) {
        esbuildOptions.plugins?.push({
            name: "on-end",
            setup: (build: esbuild.PluginBuild) => {
                build.onEnd(async (result: esbuild.BuildResult) => {
                    await afterBundle(result)
                })
            },
        })

        async function esbuildWatch() {
            const ctx = await esbuild.context(esbuildOptions)
            await ctx.watch()
        }

        console.log(chalk.blue("Watching..."))
        initReloadServer()
        esbuildWatch()
    } else {
        const result = await esbuild.build(esbuildOptions)
        await afterBundle(result)
    }
}
