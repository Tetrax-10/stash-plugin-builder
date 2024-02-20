import chalk from "chalk"
import fs from "fs"
import path from "path"
import os from "os"
import { parse as parseYml, stringify as stringifyYml } from "yaml"
import { fileURLToPath } from "url"

import Shared from "../shared/shared"

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

export function writeFile(filePath: string, content: string, append?: boolean, prepend?: boolean) {
    const parentFolder = path.dirname(filePath)
    if (!fsExsists(parentFolder)) createFolder(parentFolder)

    if (append) {
        fs.appendFileSync(filePath, content)
    } else if (prepend) {
        const oldContent = getFileContents(filePath)
        fs.writeFileSync(filePath, content + oldContent)
    } else {
        fs.writeFileSync(filePath, content)
    }
}

export function fsExsists(paths: string | string[]): boolean | string[] {
    if (typeof paths === "object") {
        const availablePaths = []
        for (const path of paths) {
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

export function fsDelete(filePath: string): boolean {
    try {
        fs.rmSync(filePath, { recursive: true, force: true })
        return true
    } catch (err) {
        return false
    }
}

export function getDirname(): string {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    return __dirname
}

export function getRootPath(_path = ""): string {
    return path.join(path.resolve(getDirname(), "../../../"), _path)
}

export function getAsset(filePath: string, needPath?: boolean): string {
    const assetPath = path.join(getDirname(), "../assets", filePath)
    if (needPath) {
        return assetPath
    }
    return getFileContents(assetPath)
}

export function getYml(filePath: string, exitOnErr?: boolean): object | null {
    if (!fsExsists(filePath)) return null
    try {
        return parseYml(getFileContents(filePath))
    } catch (error) {
        console.log(chalk.red("yml-parser: yml parsing error! please check if the file is in correct format."))
        if (exitOnErr) process.exit()
        return null
    }
}

export function writeYml(filePath: string, content: string | object) {
    writeFile(filePath, stringifyYml(content).replace(/(version: )"([^"]+)"/g, "$1$2"))
}

export function getTempPath(_path = ""): string {
    return path.join(os.tmpdir(), "stash-plugin-builder", _path)
}

export function getPluginPath(_path = "", pluginPath = Shared.pluginInDir): string {
    return path.join(pluginPath, _path)
}

export function getBuildPath(_path = "", buildPath = Shared.pluginOutDir): string {
    return path.join(buildPath, _path)
}

export function copy(src: string, dest: string, contents = false) {
    if (!contents) dest = path.join(dest, path.basename(src))
    fs.cpSync(src, dest, { recursive: true })
}
