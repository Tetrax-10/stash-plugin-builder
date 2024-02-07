#!/usr/bin/env node

import parseArgs from "minimist"

import Shared from "./shared/shared"
import build from "./script"
import * as Glob from "./utils/glob"

const args = process.argv.slice(2)

if (args.length && !args.includes("--script")) {
    const parsedArgs = parseArgs(args)

    function getArgv(key: string, shortKey?: string) {
        return parsedArgs[key] || (shortKey ? parsedArgs[shortKey] : parsedArgs[key[0]])
    }

    Shared.args = {
        build: getArgv("build"), // use this option to trigger build function when no args are passed
        minify: getArgv("minify"),
        watch: getArgv("watch"),
        inDir: getArgv("in"),
        outDir: getArgv("out"),
        mainJsPath: getArgv("js"),
        mainCssPath: getArgv("css"),
    }

    build()
}

export default { Glob: Glob }
