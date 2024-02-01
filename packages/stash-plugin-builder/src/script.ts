import chalk from "chalk"
import path from "path"
import "dotenv/config"

import { BuildOptions, Settings } from "./interfaces/interface"
import { isUpperCamelCase } from "./utils/utils"
import { createFolder, unixPath, getYml } from "./utils/glob"
import getEsbuildOptions from "./helpers/esbuidConfig"
import buildPlugin from "./builder/plugin"
import Shared from "./shared/shared"

export default async function build({ mainJsPath, mainCssPath, outDir, watch, minify }: BuildOptions) {
    let settings
    const settingsYml = getYml("./settings.yml", true)

    if (settingsYml === null) {
        console.log(chalk.red("settings.yml: missing settings.yml"))
        process.exit()
    } else {
        settings = settingsYml as Settings
    }

    settings.stashPluginDir = process.env.STASH_PLUGIN_DIR

    mainJsPath = mainJsPath ?? settings.ui.javascript ?? ""
    mainCssPath = mainCssPath ?? settings.ui.css ?? ""

    if (!outDir) {
        if (settings.stashPluginDir && settings.stashPluginSubDir) {
            outDir = path.join(settings.stashPluginDir, settings.stashPluginSubDir)
        } else if (settings.stashPluginDir) {
            outDir = settings.stashPluginDir
        } else {
            console.log(chalk.red(".env: 'STASH_PLUGIN_DIR' value is missing"))
            process.exit()
        }
    } else if (!isUpperCamelCase(settings.id)) {
        console.log(chalk.red("settings.yml: 'id' value should be upper camel case. eg: 'MyStashPlugin'"))
        process.exit()
    } else if (typeof settings.version !== "string") {
        console.log(chalk.red("settings.yml: 'version' value should be a string. eg: version: \"1.0\""))
        process.exit()
    } else if (!(settings.name && (settings.ui.javascript || settings.ui.css))) {
        console.log(chalk.red("settings.yml: some required keys and values are missing"))
        process.exit()
    }

    outDir = path.join(outDir, settings.id)
    createFolder(outDir)

    mainJsPath = unixPath(mainJsPath)

    Shared.outDir = outDir
    Shared.settings = settings

    const esbuildOptions = getEsbuildOptions(settings)

    await buildPlugin({
        mainJsPath,
        mainCssPath,
        outDir,
        watch,
        minify,
        settings,
        esbuildOptions,
    })
}
