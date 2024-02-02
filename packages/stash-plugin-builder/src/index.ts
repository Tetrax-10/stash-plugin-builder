#!/usr/bin/env node

import build from "./script"
// @ts-ignore
import parseArgs from "@scg82/minimist"

const argv = parseArgs(process.argv.slice(2))
// const argv = require("minimist")(process.argv.slice(2))

function getArgv(key: string, shortKey?: string) {
    return argv[key] || (shortKey ? argv[shortKey] : argv[key[0]])
}

build({
    minify: getArgv("minify"),
    watch: getArgv("watch"),
    outDir: getArgv("out"),
    mainJsPath: getArgv("js"),
    mainCssPath: getArgv("css"),
})
