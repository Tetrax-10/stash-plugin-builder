import Shared from "../shared/shared"

export function determineCssExt() {
    switch (Shared.ans.cssFramework) {
        case "Scss":
            Shared.cssExt = "scss"
            break
        case "Sass":
            Shared.cssExt = "sass"
            break
        case "Less":
            Shared.cssExt = "less"
            break
        case "Css Modules":
            Shared.cssExt = "module.css"
            break
        case "Stylus":
            Shared.cssExt = "styl"
            break
        default:
            Shared.cssExt = "css"
            break
    }
}

export function replaceContent(content: string, values: string[]): string {
    values.forEach((value, index) => {
        content = content.replace(new RegExp(`\\$replace${index + 1}`, "g"), value)
    })

    return content
}
