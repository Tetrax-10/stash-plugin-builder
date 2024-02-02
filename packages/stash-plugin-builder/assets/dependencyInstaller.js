;(async () => {
    async function callGQL(reqData) {
        const options = {
            method: "POST",
            body: JSON.stringify(reqData),
            headers: {
                "Content-Type": "application/json",
            },
        }
        try {
            const res = await window.fetch("/graphql", options)
            return res.json()
        } catch (err) {
            console.error(err)
        }
    }

    async function getInstalledPlugins() {
        try {
            const res = await callGQL({
                operationName: "Plugins",
                variables: {},
                query: "query Plugins{plugins{id}}",
            })
            return res.data.plugins.map((plugin) => plugin.id)
        } catch (err) {
            console.error(err)
        }
    }

    async function isPluginInstalled(plugin) {
        const installedPlugins = await getInstalledPlugins()
        return installedPlugins.includes(plugin)
    }

    async function installPlugin(plugin, src) {
        try {
            await callGQL({
                operationName: "InstallPluginPackages",
                variables: {
                    packages: [
                        {
                            id: plugin,
                            sourceURL: src,
                        },
                    ],
                },
                query: "mutation InstallPluginPackages($packages: [PackageSpecInput!]!) {installPackages(type: Plugin, packages: $packages)}",
            })
        } catch (err) {
            console.error(err)
        }
    }

    const requiredPlugins = $replace1

    let pluginInstalled = false

    requiredPlugins.forEach(async ({ id, source }) => {
        const isStashUSLInstalled = await isPluginInstalled(id)
        if (!isStashUSLInstalled) {
            await installPlugin(id, source)
            pluginInstalled = true
        }
    })

    setTimeout(() => {
        if (pluginInstalled) window.location.reload()
    }, 5000)
})()
