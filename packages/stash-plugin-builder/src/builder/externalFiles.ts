import Shared from "../shared/shared"
import { copy, fsExsists, getBuildPath } from "../utils/glob"

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
