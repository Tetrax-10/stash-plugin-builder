import * as esbuild from "esbuild"
import autoprefixer from "autoprefixer"
import { externalGlobalPlugin } from "esbuild-plugin-external-global"

const postCssPlugin = require("@baurine/esbuild-plugin-postcss3")

import { Settings } from "../interfaces/interface"

export default function getEsbuildOptions(settings: Settings): esbuild.BuildOptions {
    const externalPackages = {
        react: "PluginApi.React",
        "react-dom": "PluginApi.ReactDOM",
        "@apollo/client": "PluginApi.libraries.Apollo",
        "react-bootstrap": "PluginApi.libraries.Bootstrap",
        "@fortawesome/free-regular-svg-icons": "PluginApi.libraries.FontAwesomeRegular",
        "@fortawesome/free-solid-svg-icons": "PluginApi.libraries.FontAwesomeSolid",
        "react-intl": "PluginApi.libraries.Intl",
        "react-router-dom": "PluginApi.libraries.ReactRouterDOM",
    }

    return {
        platform: "browser",
        format: "esm",
        external: Object.keys(externalPackages),
        bundle: true,
        plugins: [
            postCssPlugin.default({
                plugins: [autoprefixer],
                modules: {
                    generateScopedName: `[name]__[local]___[hash:base64:5]_${settings.id}`,
                },
            }),
            externalGlobalPlugin(externalPackages),
        ],
    }
}
