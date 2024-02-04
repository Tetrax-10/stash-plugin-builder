import chalk from "chalk"

import { getPluginPath, getYml, unixPath } from "../utils/glob"

import { Settings } from "../interfaces/interface"

export default function getSettingsYml(): Settings {
    const settingsYml: Settings | null = getYml(getPluginPath("settings.yml"), true) as Settings | null

    if (settingsYml === null) {
        console.log(chalk.red("settings.yml: missing settings.yml"))
        process.exit()
    }

    settingsYml.ui.javascript = unixPath(getPluginPath(settingsYml.ui.javascript))
    settingsYml.ui.css = unixPath(getPluginPath(settingsYml.ui.css))

    if (settingsYml.ui.include?.length) {
        settingsYml.ui.include.forEach((filePath, index, array) => {
            array[index] = unixPath(getPluginPath(filePath))
        })
    }

    if (settingsYml.include?.length) {
        settingsYml.include.forEach((filePath, index, array) => {
            array[index] = unixPath(getPluginPath(filePath))
        })
    }

    return settingsYml
}
