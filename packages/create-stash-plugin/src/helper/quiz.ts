import os from "os"
import path from "path"

import { fsExsists, unixPath } from "../utils/glob"
import { Answers } from "../interface/interface"

export default function getQuiz() {
    return [
        {
            type: "input",
            name: "name",
            message: "What's the name of your plugin?",
            default: "My Plugin",
            validate: (value: string) => {
                if (/^[A-Z][a-zA-Z0-9\s-]+$/.test(value)) {
                    return true
                } else {
                    return 'Please enter a valid name like "My Plugin"'
                }
            },
        },
        {
            type: "input",
            name: "id",
            message: "Give your plugin an ID",
            default: (ans: Answers) => ans.name.replace(/[ -]/g, ""),
            validate: (value: string) => {
                if (/^[A-Z][a-zA-Z0-9]+$/.test(value)) {
                    if (!fsExsists(value)) {
                        return true
                    } else {
                        return "A folder with this ID already exists"
                    }
                } else {
                    return "Please enter a valid name ID"
                }
            },
        },
        {
            type: "input",
            name: "stashPluginDir",
            message: "Where is your stash plugins folder?",
            default: () => path.join(os.homedir(), ".stash", "plugins"),
            filter: (value: string) => unixPath(value),
            validate: (value: string) => {
                if (fsExsists(value)) {
                    return true
                } else {
                    return "Folder doesn't exist"
                }
            },
        },
        {
            type: "list",
            name: "boilerplate",
            message: "What boilerplate do you want?",
            choices: ["JS (plugin)", "CSS (theme)", "JS and CSS"],
            filter: (value: string) => {
                if (value === "JS (plugin)") {
                    return "JS"
                } else if (value === "CSS (theme)") {
                    return "CSS"
                } else {
                    return value
                }
            },
        },
        {
            type: "list",
            name: "isPluginWithCss",
            message: "Boilerplate mode",
            choices: ["Theme with JS", "Plugin with CSS"],
            when: (ans: Answers) => ans.boilerplate === "JS and CSS",
            filter: (value: string) => value === "Plugin with CSS",
        },
        {
            type: "list",
            name: "isTypeScript",
            message: "Boilerplate language",
            choices: ["JavaScript", "TypeScript"],
            when: (ans: Answers) => ans.boilerplate.includes("JS"),
            filter: (value: string) => value === "TypeScript",
        },
        {
            type: "list",
            name: "isReact",
            message: "JS framework",
            choices: (ans: Answers) => {
                const choices = ["Vanilla ", "React"]
                choices[0] += ans.isTypeScript ? "TS" : "JS"
                return choices
            },
            when: (ans: Answers) => ans.boilerplate.includes("JS"),
            filter: (value: string) => value === "React",
        },
        {
            type: "list",
            name: "cssFramework",
            message: "CSS framework",
            choices: ["Vanilla CSS", "SCSS", "SASS", "CSS modules"],
            when: (ans: Answers) => ans.boilerplate.includes("CSS"),
        },
    ]
}
