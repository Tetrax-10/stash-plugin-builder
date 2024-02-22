import Shared from "../shared/shared"
import { getBuildPath, getFileContents, getPluginPath, writeYml } from "../utils/glob"

export default function buildPluginYml(isProcessJS: number | undefined, isProcessCss: number | undefined) {
    // need to do the typescript part
    // eslint-disable-next-line
    const pluginYml: any = structuredClone(Shared.settings)
    const rawSettingsYml = getFileContents(getPluginPath("settings.yml"))

    delete pluginYml.id
    delete pluginYml.stashPluginDir
    delete pluginYml.stashPluginSubDir
    delete pluginYml.ui?.include
    delete pluginYml.include
    delete pluginYml.externalPath

    if (Shared.dependencies.length) {
        pluginYml.ui.requires = Shared.dependencies
    } else {
        delete pluginYml.ui?.requires
    }

    if (isProcessJS) {
        pluginYml.ui.javascript = [`${Shared.settings.id}.js`]
    } else {
        delete pluginYml.ui.javascript
    }
    if (isProcessCss) {
        pluginYml.ui.css = [`${Shared.settings.id}.css`]
    } else {
        delete pluginYml.ui.css
    }

    if (Shared.settings.version) {
        pluginYml.version = rawSettingsYml.match(/^version:\s*(['"]?)([0-9]+(?:\.[0-9]+)*)\1/m)?.[2]?.trim() ?? Shared.settings.version
    }

    writeYml(getBuildPath(`${Shared.settings.id}.yml`), pluginYml)
}
