import path from "path"
import chalk from "chalk"
import * as esbuild from "esbuild"

import Shared from "../shared/shared"
import buildPluginYml from "./yml"
import { replaceContent } from "../utils/utils"
import { buildExternalFiles } from "./externalFiles"
import { initReloadServer, webSocketData } from "../helpers/reloadServer"
import { createFolder, fsExsists, writeFile, fsDelete, getAsset, unixPath, getBuildPath, getTempPath } from "../utils/glob"

import { CompiledCode } from "../interfaces/interface"

export default async function buildPlugin() {
    const compiledJsPath = getBuildPath(`${Shared.settings.id}.js`)
    const compiledCssPath = getBuildPath(`${Shared.settings.id}.css`)

    const tempPath = getTempPath()
    const tempIndexJsPath = getTempPath(`${Shared.settings.id}.js`)

    const esbuildEntryPoints: string[] = []

    const mainJsAbsolutePath = Shared.settings.ui.javascript ? unixPath(path.resolve(Shared.settings.ui.javascript)) : ""

    const isProcessJS = mainJsAbsolutePath && fsExsists(mainJsAbsolutePath)
    const isProcessCss = Shared.settings.ui.css && fsExsists(Shared.settings.ui.css)

    fsDelete(tempPath)
    createFolder(tempPath)

    // add main js to esbuild entry points
    if (isProcessJS) {
        writeFile(tempIndexJsPath, replaceContent(getAsset("callMainFunc.js"), [mainJsAbsolutePath]))
        esbuildEntryPoints.push(tempIndexJsPath)
    }

    // add main css to esbuild entry points
    // @ts-expect-error skip
    if (isProcessCss) esbuildEntryPoints.push(Shared.settings.ui.css)

    // add ui include files to esbuild entry point
    if (typeof Shared.settings.ui.include === "object" && Shared.settings.ui.include?.length) {
        const availableIncludes = fsExsists(Shared.settings.ui.include)
        if (typeof availableIncludes === "object" && availableIncludes.length) {
            esbuildEntryPoints.push(...availableIncludes)
        }
    }

    // filter cross-source dependencies
    if (Shared.settings.ui.requires?.length) {
        for (const plugin of Shared.settings.ui.requires) {
            if (typeof plugin === "object" && plugin.source) {
                Shared.crossSourceDependencies.push(plugin)
            } else if (typeof plugin === "string") {
                Shared.dependencies.push(plugin)
            } else {
                console.log(chalk.red("dependency installer: invalid dependency structure"))
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
            compiledCode.js.forEach((code) => {
                let compiledJsCode = code
                if (Shared.args.minify) {
                    compiledJsCode = replaceContent(getAsset("wrapper.min.js"), [compiledJsCode.trim()])
                } else {
                    compiledJsCode = replaceContent(getAsset("wrapper.js"), [compiledJsCode])
                }

                FinalCompiledJs += compiledJsCode
            })
            writeFile(compiledJsPath, FinalCompiledJs)
        }

        // write all css contents
        if (compiledCode?.css?.length) {
            let FinalCompiledCss = ""
            compiledCode?.css?.forEach((code) => {
                FinalCompiledCss += Shared.args.minify ? code.trim() : code
            })
            writeFile(compiledCssPath, FinalCompiledCss)
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
