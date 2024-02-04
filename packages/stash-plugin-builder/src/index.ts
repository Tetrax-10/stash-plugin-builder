#!/usr/bin/env node

import parseArgs from "minimist"

import Shared from "./shared/shared"
import build from "./script"

const argv = parseArgs(process.argv.slice(2))

function getArgv(key: string, shortKey?: string) {
    return argv[key] || (shortKey ? argv[shortKey] : argv[key[0]])
}

Shared.args = {
    minify: getArgv("minify"),
    watch: getArgv("watch"),
    inDir: getArgv("in"),
    outDir: getArgv("out"),
    mainJsPath: getArgv("js"),
    mainCssPath: getArgv("css"),
}

build()
