import * as esbuild from "esbuild"
import autoprefixer from "autoprefixer"
// @ts-expect-error skip
import postCssPlugin from "@baurine/esbuild-plugin-postcss3"
import { globalExternals } from "@fal-works/esbuild-plugin-global-externals"

import Shared from "../shared/shared"
import { fsExsists, getPluginPath } from "../utils/glob"

export default function getEsbuildOptions(): esbuild.BuildOptions {
    const externalPackages = {
        react: "PluginApi.React",
        "react-dom": "PluginApi.ReactDOM",
        "@apollo/client": "PluginApi.libraries.Apollo",
        "react-bootstrap": "PluginApi.libraries.Bootstrap",
        "@fortawesome/free-regular-svg-icons": "PluginApi.libraries.FontAwesomeRegular",
        "@fortawesome/free-solid-svg-icons": "PluginApi.libraries.FontAwesomeSolid",
        "react-intl": "PluginApi.libraries.Intl",
        mousetrap: "PluginApi.libraries.Mousetrap",
        "mousetrap-pause": "PluginApi.libraries.MousetrapPause",
        "react-router-dom": "PluginApi.libraries.ReactRouterDOM",
    }

    return {
        platform: "browser",
        format: "esm",
        external: Object.keys(externalPackages),
        bundle: true,
        ...(fsExsists(getPluginPath("tsconfig.json")) ? { tsconfig: getPluginPath("tsconfig.json") } : {}),
        plugins: [
            postCssPlugin.default({
                plugins: [autoprefixer],
                modules: {
                    generateScopedName: `[name]__[local]___[hash:base64:5]_${Shared.settings.id}`,
                },
            }),
            globalExternals(externalPackages),
        ],
    }
}
