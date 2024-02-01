import { Settings } from "../interfaces/interface"
import { writeFile, writeYml } from "../utils/glob"

export default function buildPluginYml(outDir: string, settings: Settings, pluginRequires: string[], isProcessJS: number | undefined, isProcessCss: number | undefined) {
    // need to do the typescript part
    const pluginYml: any = structuredClone(settings)

    delete pluginYml.id
    delete pluginYml.stashPluginDir
    delete pluginYml.stashPluginSubDir
    delete pluginYml.ui?.include
    if (pluginRequires.length) {
        pluginYml.ui.requires = pluginRequires
    } else {
        delete pluginYml.ui?.requires
    }

    if (isProcessJS) pluginYml.ui.javascript = [`${settings.id}.js`]
    if (isProcessCss) pluginYml.ui.css = [`${settings.id}.css`]

    writeYml(`${outDir}/${settings.id}.yml`, pluginYml)

    pluginRequires.forEach((plugin: string) => {
        writeFile(`${outDir}/${settings.id}.yml`, `# requires: ${plugin}\n`, true)
    })
}
