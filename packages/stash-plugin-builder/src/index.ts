#!/usr/bin/env node

import build from "./script"
const argv = require("minimist")(process.argv.slice(2))

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
