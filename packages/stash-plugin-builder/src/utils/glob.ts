import chalk from "chalk"
import fs from "fs"
import path from "path"
import os from "os"
import { parse as parseYml, stringify as stringifyYml } from "yaml"

import Shared from "../shared/shared"

export function unixPath(str: string): string {
    if (str) {
        return str.replaceAll("\\", "/")
    } else {
        return ""
    }
}

function getFileContents(filePath: string): string {
    return fs.readFileSync(filePath, "utf-8")
}

export function writeFile(filePath: string, content: string, append?: boolean) {
    if (!append) {
        fs.writeFileSync(filePath, content)
        return
    }

    fs.appendFileSync(filePath, content)
}

export function fsExsists(paths: string | string[]): boolean | string[] {
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

export function deleteFile(filePath: string): boolean {
    try {
        fs.unlinkSync(filePath)
        return true
    } catch (err) {
        return false
    }
}

export function getAsset(filePath: string, needPath?: boolean): string {
    const assetPath = path.join(__dirname, "../assets", filePath)
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

export function getTempPath(_path: string): string {
    return path.join(os.tmpdir(), _path)
}

export function getBuildPath(_path = ""): string {
    return path.join(Shared.outDir, _path)
}

export function copy(src: string, des: string) {
    fs.cpSync(src, des, { recursive: true })
}
