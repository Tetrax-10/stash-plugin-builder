import path from "path"
import chalk from "chalk"
import chokidar from "chokidar"

import Shared from "../shared/shared"
import { copy, fsExsists, getBuildPath } from "../utils/glob"
import { reloadStash } from "../helpers/reloadServer"

export function buildExternalFiles() {
    Shared.settings.include?.forEach((_path) => {
        let isCopyContents = false

        if (_path.endsWith("/*")) {
            _path = _path.slice(0, -2)
            isCopyContents = true
        }

        if (fsExsists(_path)) copy(_path, getBuildPath(), isCopyContents)
    })
}

export function watchExternalFiles() {
    if (Shared.settings.include?.length) {
        const toWatch = Shared.settings.include.map((path) => (path.endsWith("/*") ? path.slice(0, -2) : path))
        chokidar.watch(toWatch).on("change", (updatedFilePath) => {
            buildExternalFiles()

            console.log(chalk.green(`${path.basename(updatedFilePath)} updated ✅`))

            reloadStash()
        })
    }
}
