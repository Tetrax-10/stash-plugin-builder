import chalk from "chalk"
import path from "path"
import { configDotenv } from "dotenv"

import Shared from "./shared/shared"
import buildPlugin from "./builder/plugin"
import getSettingsYml from "./helpers/settingsYml"
import getEsbuildOptions from "./helpers/esbuidConfig"
import { isLowerCamelCase } from "./utils/utils"
import { createFolder, unixPath, getRootPath } from "./utils/glob"

configDotenv({
    path: getRootPath(".env"),
})

export default async function build() {
    Shared.pluginInDir = Shared.args?.inDir ?? process.env.INIT_CWD

    Shared.settings = getSettingsYml()

    Shared.stashPluginDir = process.env.STASH_PLUGIN_DIR

    Shared.settings.ui.javascript = unixPath(Shared.args.mainJsPath ?? Shared.settings.ui.javascript ?? "")
    Shared.settings.ui.css = unixPath(Shared.args.mainCssPath ?? Shared.settings.ui.css ?? "")

    if (!isLowerCamelCase(Shared.settings.id)) {
        console.log(chalk.red("settings.yml: 'id' value should be lower camel case. eg: 'myStashPlugin'"))
        process.exit()
    } else if (!Shared.settings.version) {
        console.log(chalk.red("settings.yml: version info is missing"))
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
