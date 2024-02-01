import { copy, fsExsists, getBuildPath } from "../utils/glob"

export function buildExternalFiles() {
    if (fsExsists("./_include")) {
        copy("./_include", getBuildPath())
    }
}
