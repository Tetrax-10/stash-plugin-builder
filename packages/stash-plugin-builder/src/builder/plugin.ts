import chalk from "chalk"
import path from "path"
import * as esbuild from "esbuild"

import { PluginBuildOptions } from "../interfaces/interface"
import { createFolder, fsExsists, writeFile, deleteFile, getAsset, unixPath, getBuildPath, getTempPath } from "../utils/glob"
import { initReloadServer, webSocketData } from "../helpers/reloadServer"
import buildPluginYml from "./yml"
import Shared from "../shared/shared"
import { buildExternalFiles } from "./externalFiles"
import { replaceContent } from "../utils/utils"

export default async function buildPlugin({ mainJsPath, mainCssPath, outDir, watch, minify, settings, esbuildOptions }: PluginBuildOptions) {
    const compiledJsPath = getBuildPath(`${settings.id}.js`)
    const compiledCssPath = getBuildPath(`${settings.id}.css`)

    const tempPath = getTempPath()
    const tempIndexJsPath = getTempPath("index.js")

    const esbuildEntryPoints: string[] = []

    mainJsPath = mainJsPath ? unixPath(path.resolve(mainJsPath)) : ""

    const isProcessJS = mainJsPath && fsExsists(mainJsPath)
    const isProcessCss = mainCssPath && fsExsists(mainCssPath)

    deleteFile(tempPath)
    createFolder(tempPath)

    // add main js to esbuild entry points
    if (isProcessJS) {
        writeFile(tempIndexJsPath, replaceContent(getAsset("wrapper.js"), [mainJsPath]))
        esbuildEntryPoints.push(tempIndexJsPath)
    }

    // add main css to esbuild entry points
    if (isProcessCss) esbuildEntryPoints.push(mainCssPath)

    // add include files from settings.yml to esbuild entry point
    if (settings.ui.include?.length) {
        const availableIncludes = fsExsists(settings.ui.include)
        // @ts-ignore
        esbuildEntryPoints.push(...availableIncludes)
    }

    // filter cross-source dependencies
    if (settings.ui.requires?.length) {
        for (let plugin of settings.ui.requires) {
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

    esbuildOptions = {
        entryPoints: esbuildEntryPoints,
        outdir: outDir,
        minify: minify,
        write: false,
        ...esbuildOptions,
    }

    async function afterBundle(result: esbuild.BuildResult) {
        // get organized object of compiled js and css
        interface CompiledCode {
            js?: string[]
            css?: string[]
        }
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
        if (isProcessJS && compiledCode?.js?.length) {
            compiledCode.js.forEach((compiledJs: string, index: number) => {
                compiledJs = minify ? compiledJs.trim() : compiledJs
                writeFile(compiledJsPath, compiledJs, index === 0 ? false : true)
            })
        }

        // write all css contents
        if (compiledCode?.css?.length) {
            compiledCode.css.forEach((compiledCss: string, index: number) => {
                compiledCss = minify ? compiledCss.trim() : compiledCss
                writeFile(compiledCssPath, compiledCss, index === 0 ? false : true)
            })
        }

        // builds yml file for the plugin
        buildPluginYml(compiledCode?.js?.length, compiledCode?.css?.length)
        buildExternalFiles()

        console.log(chalk.green(`${settings.name} built ✅`))

        // tells stash-plugin-builder's reload client to reload the stash website
        if (watch && webSocketData.socket?.send) {
            webSocketData.socket.send("reload")
        } else if (webSocketData.connected) {
            console.log(chalk.red("reload-server: connection lost to stash website! ❌"))
            console.log(chalk.blue("reload-server: reload stash website to re-connect 🔄️"))
            webSocketData.connected = false
        }
    }

    // initialize reload server
    if (watch && settings.stashPluginDir) {
        esbuildOptions.plugins?.push({
            name: "on-end",
            setup(build: esbuild.PluginBuild) {
                build.onEnd(async (result: esbuild.BuildResult) => {
                    await afterBundle(result)
                })
            },
        })

        async function esbuildWatch() {
            // @ts-ignore
            const ctx = await esbuild.context(esbuildOptions)
            await ctx.watch()
        }

        console.log(chalk.blue("Watching..."))
        initReloadServer(settings.stashPluginDir)
        esbuildWatch()
    } else {
        const result = await esbuild.build(esbuildOptions)
        await afterBundle(result)
    }
}
