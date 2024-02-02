import path from "path"

import Shared from "../shared/shared"
import { copy, fsExsists, getBuildPath, isPathType } from "../utils/glob"

export function buildExternalFiles() {
    Shared.settings.include?.forEach((_path) => {
        if (fsExsists(_path)) {
            if (isPathType(_path, "dir")) {
                copy(_path, getBuildPath())
            } else {
                copy(_path, getBuildPath(path.basename(_path)))
            }
        }
    })
}
