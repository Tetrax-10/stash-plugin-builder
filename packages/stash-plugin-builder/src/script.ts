import chalk from "chalk"
import path from "path"
import "dotenv/config"

import Shared from "./shared/shared"
import { isUpperCamelCase } from "./utils/utils"
import { createFolder, unixPath, getYml } from "./utils/glob"
import getEsbuildOptions from "./helpers/esbuidConfig"
import buildPlugin from "./builder/plugin"

import { Settings } from "./interfaces/interface"

export default async function build() {
    const settingsYml = getYml("./settings.yml", true)

    if (settingsYml === null) {
        console.log(chalk.red("settings.yml: missing settings.yml"))
        process.exit()
    } else {
        Shared.settings = settingsYml as Settings
    }

    Shared.settings.stashPluginDir = process.env.STASH_PLUGIN_DIR

    Shared.args.mainJsPath = unixPath(Shared.args.mainJsPath ?? Shared.settings.ui.javascript ?? "")
    Shared.args.mainCssPath = unixPath(Shared.args.mainCssPath ?? Shared.settings.ui.css ?? "")

    if (!isUpperCamelCase(Shared.settings.id)) {
        console.log(chalk.red("settings.yml: 'id' value should be upper camel case. eg: 'MyStashPlugin'"))
        process.exit()
    } else if (typeof Shared.settings.version !== "string") {
        console.log(chalk.red("settings.yml: 'version' value should be a string. eg: version: \"1.0\""))
        process.exit()
    } else if (!(Shared.settings.name && (Shared.settings.ui.javascript || Shared.settings.ui.css))) {
        console.log(chalk.red("settings.yml: some required keys and values are missing"))
        process.exit()
    }

    if (!Shared.args.outDir) {
        if (Shared.settings.stashPluginDir && Shared.settings.stashPluginSubDir) {
            Shared.args.outDir = path.join(Shared.settings.stashPluginDir, Shared.settings.stashPluginSubDir)
        } else if (Shared.settings.stashPluginDir) {
            Shared.args.outDir = Shared.settings.stashPluginDir
        } else {
            console.log(chalk.red(".env: 'STASH_PLUGIN_DIR' value is missing"))
            process.exit()
        }
    }

    Shared.pluginOutDir = path.join(Shared.args.outDir, Shared.settings.id)

    createFolder(Shared.pluginOutDir)

    Shared.esbuildOptions = getEsbuildOptions()

    await buildPlugin()
}
