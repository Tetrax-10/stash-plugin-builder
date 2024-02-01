import { Settings } from "../interfaces/interface"
import Shared from "../shared/shared"
import { getBuildPath, writeFile, writeYml } from "../utils/glob"

export default function buildPluginYml(isProcessJS: number | undefined, isProcessCss: number | undefined) {
    // need to do the typescript part
    const pluginYml: any = structuredClone(Shared.settings)

    delete pluginYml.id
    delete pluginYml.stashPluginDir
    delete pluginYml.stashPluginSubDir
    delete pluginYml.ui?.include
    if (Shared.dependencies.length) {
        pluginYml.ui.requires = Shared.dependencies
    } else {
        delete pluginYml.ui?.requires
    }

    if (isProcessJS) pluginYml.ui.javascript = [`${Shared.settings.id}.js`]
    if (isProcessCss) pluginYml.ui.css = [`${Shared.settings.id}.css`]

    writeYml(getBuildPath(`${Shared.settings.id}.yml`), pluginYml)

    Shared.dependencies.forEach((plugin: string) => {
        writeFile(getBuildPath(`${Shared.settings.id}.yml`), `# requires: ${plugin}\n`, true)
    })
}
