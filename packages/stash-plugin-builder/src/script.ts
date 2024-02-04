import chalk from "chalk"
import path from "path"
import { configDotenv } from "dotenv"

import Shared from "./shared/shared"
import buildPlugin from "./builder/plugin"
import getSettingsYml from "./helpers/settingsYml"
import getEsbuildOptions from "./helpers/esbuidConfig"
import { isUpperCamelCase } from "./utils/utils"
import { createFolder, unixPath, getRootPath } from "./utils/glob"

configDotenv({
    path: getRootPath(".env"),
})

export default async function build() {
    Shared.pluginInDir = Shared.args?.inDir ?? ""

    Shared.settings = getSettingsYml()

    Shared.stashPluginDir = process.env.STASH_PLUGIN_DIR

    Shared.settings.ui.javascript = unixPath(Shared.args.mainJsPath ?? Shared.settings.ui.javascript ?? "")
    Shared.settings.ui.css = unixPath(Shared.args.mainCssPath ?? Shared.settings.ui.css ?? "")

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
        if (Shared.stashPluginDir && Shared.settings.stashPluginSubDir) {
            Shared.args.outDir = path.join(Shared.stashPluginDir, Shared.settings.stashPluginSubDir)
        } else if (Shared.stashPluginDir) {
            Shared.args.outDir = Shared.stashPluginDir
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
