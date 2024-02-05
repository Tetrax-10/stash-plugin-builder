import Shared from "../shared/shared"

export function determineCssExt() {
    switch (Shared.ans.cssFramework) {
        case "SCSS":
            Shared.cssExt = "scss"
            break
        case "SASS":
            Shared.cssExt = "sass"
            break
        case "CSS modules":
            Shared.cssExt = "module.css"
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
