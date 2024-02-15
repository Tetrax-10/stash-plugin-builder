import path from "path"

export function isUpperCamelCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str)
}

export function isLowerCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str)
}

export function replaceContent(content: string, values: string[]): string {
    values.forEach((value, index) => {
        content = content.replace(new RegExp(`\\$replace${index + 1}`, "g"), value)
    })

    return content
}

export function isJs(filePath: string) {
    const allowedExtensions = [".js", ".jsx", ".ts", ".tsx"]
    return allowedExtensions.includes(path.extname(filePath))
}
