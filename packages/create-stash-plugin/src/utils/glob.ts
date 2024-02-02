import fs from "fs"
import path from "path"
import { stringify as stringifyYml } from "yaml"
import { fileURLToPath } from "url"

import Shared from "../shared/shared"

// @ts-ignore
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function unixPath(str: string): string {
    if (str) {
        return str.replaceAll("\\", "/")
    } else {
        return ""
    }
}

export function getFileContents(filePath: string): string {
    return fs.readFileSync(filePath, "utf-8")
}

export function writeFile(filePath: string, content: string, append?: boolean) {
    const parentFolder = path.dirname(filePath)
    if (!fsExsists(parentFolder)) createFolder(parentFolder)

    if (!append) {
        fs.writeFileSync(filePath, content)
        return
    }

    fs.appendFileSync(filePath, content)
}

export function fsExsists(paths: string[] | string): string[] | boolean {
    if (typeof paths === "object") {
        const availablePaths = []
        for (let path of paths) {
            if (fs.existsSync(path)) availablePaths.push(path)
        }
        return availablePaths
    }
    return fs.existsSync(paths)
}

export function createFolder(folderPath: string) {
    if (!fsExsists(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
}

export function getAsset(filePath: string, needPath?: boolean): string {
    const assetPath = path.join(__dirname, "../template", filePath)
    if (needPath) {
        return assetPath
    }
    return getFileContents(assetPath)
}

export function copy(src: string, des: string) {
    fs.cpSync(src, des, { recursive: true })
}

export function getProjectPath(_path = ""): string {
    return path.join(Shared.projectDir, _path)
}

export function writeYml(filePath: string, content: string | object) {
    writeFile(filePath, stringifyYml(content))
}
