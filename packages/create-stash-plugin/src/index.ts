#!/usr/bin/env node

import inquirer from "inquirer"
import path from "path"
import chalk from "chalk"
import spawn from "cross-spawn"

import getQuiz from "./helper/quiz"
import Shared from "./shared/shared"
import { determineCssExt, generateCss, generateEnv, generateGitIgnore, generateIndexJs, generatePackageJson, generateSettings, generateTSConfig } from "./generator/generate"
import { Answers } from "./interface/interface"

// @ts-ignore
inquirer.prompt(getQuiz()).then(async (ans: Answers) => {
    try {
        const projectDir = path.join(".", ans.id)

        Shared.projectDir = projectDir
        Shared.ans = ans

        determineCssExt()
        generateIndexJs()
        generateCss()
        generateSettings()
        generatePackageJson()
        generateGitIgnore()
        generateTSConfig()
        generateEnv()

        // const packageManager = (process.env.npm_config_user_agent || "").indexOf("yarn") === 0 ? "yarn" : "npm"
        // const exeResult = spawn.sync(`cd ${projectDir} && ${packageManager} ${packageManager === "npm" ? "install" : "add"} -D ${Shared.devDependencies.sort().join(" ")}`, {
        //     stdio: "inherit",
        //     shell: true,
        // })
        // if (exeResult.error) throw "Couldn't install dependencies: " + exeResult.error.message

        console.log(`\n${chalk.green("Success: ")}${ans.isReact ? "React " : ""}Plugin boilerplate has been generated`)
    } catch (err) {
        console.error(`\n${chalk.red("Error, something went wrong:")}`, err)
    }
})
