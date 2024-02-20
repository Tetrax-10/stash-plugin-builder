import { SharedInterface } from "../interface/interface"

const Shared: SharedInterface = {
    projectDir: "",
    ans: {
        name: "",
        id: "",
        stashPluginDir: "",
        boilerplate: "",
        isPluginWithCss: false,
        isTypeScript: false,
        isReact: false,
        cssFramework: "",
    },
    jsExt: "js",
    cssExt: "css",
    mainCssPath: "",
    devDependencies: ["stash-plugin-builder"],
}

export default Shared
