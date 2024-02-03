# stash-plugin-builder

Build [Stash](https://stashapp.cc/) plugins using React, SCSS, and other libraries with TypeScript support.

[![stash-plugin-builder](https://nodei.co/npm/stash-plugin-builder.png)](https://www.npmjs.com/package/stash-plugin-builder)

</br>

## Benefits of using stash-plugin-builder:

1. Supports **React, JSX, TypeScript, SCSS, SASS** and **CSS modules** out of the box
2. Live reloading
3. Install npm packages and ship it with your plugins
4. [Cross-source dependency installer](#cross-source-dependency-installer)
5. and more...

</br>

## Usage

### 1. Generate boilerplate using [create-stash-plugin](https://www.npmjs.com/package/create-stash-plugin)

**npm**

```sh
npx create-stash-plugin
```

**yarn**

```sh
yarn create stash-plugin
```

</br>

### 2. Build plugin

`cd` to the generated plugin folder and run

```sh
npm/yarn run build
```

_The plugin will be built in your `stash plugins folder`. Reload `stash`, and the plugin should be listed in the `Plugins tab`. If not, try clicking `Reload plugins` button and reload again._

</br>

### 3. Watch plugin

Run this npm command and reload `stash` just once to connect `stash-plugin-builder` and `stash`

```sh
npm/yarn run watch
```

_Just saving the source code file will auto build and reload stash._

</br>

### 4. Build plugin for distribution

```sh
npm/yarn run build-dist
```

_This will build the plugin and output the distributable plugin to the `dist` folder. You can change this folder in `package.json`._

</br>

## settings.yml structure

The `npx create-stash-plugin` command should generate a basic `settings.yml`. However, if you wish to configure advanced settings, please adhere to this structure. The `settings.yml` follows the same structure as the [stash plugin.yml](https://docs.stashapp.cc/in-app-manual/plugins/#plugin-configuration-file-format) but with extra configuration. See the example below:

```yml
id: MyPlugin # should be upper camel case
name: My Plugin
description: My plugin does awesome things
version: "1.0" # should be a string
stashPluginSubDir: my-plugins-dev # optional sub-dir inside your stash plugins folder
ui:
    javascript: ./src/index.js # main js file
    css: ./styles/main.css # main css file
    include: # external js and css files that aren't part of main ui files
        - ./lib/colors.js
        - ./scripts/injectRemoteCode.js
    requires:
        - id: MyUtilsLibrary # local plugin id
        - id: MyReactComponentsLibrary # local plugin id
        - id: StashUserscriptLibrary # cross-source plugin id
          source: https://stashapp.github.io/CommunityScripts/stable/index.yml # cross-source plugin source url
    # the following assets and csp are just default plugin.yml structure
    assets: # optional list of assets
        urlPrefix: fsLocation
    csp: # content-security policy overrides
        script-src:
            - http://alloweddomain.com
        style-src:
            - http://alloweddomain.com
        connect-src:
            - http://alloweddomain.com
include: # include external files
    - ./assets # all contents inside assets folder will be copied to the output folder
    - ./python/foo.py # foo.py will be copied to the output folder
    - ./settings/external/config.json # config.json will be copied to the output folder
# the following are just default plugin.yml structure
# the following are used for plugin tasks only
exec:
    - python
    - "{pluginDir}/foo.py" # values with variable should be wrapped with double quotes
interface: raw
errLog: error
tasks:
    - name: <operation name>
      description: <optional description>
      execArgs:
          - <arg to add to the exec line>
```

</br>

## Cross-source dependency installer

You can simply specify the **dependency plugin's id and source**, the `stash-plugin-builder` will automatically bundle a cross-source dependency installer script with your plugin. Therefore, when users install your plugin, the cross-source dependencies will be installed automatically.

```yml
ui:
    requires:
        - id: MyUtilsLibrary # local plugin id
        - id: MyReactComponentsLibrary # local plugin id
        - id: StashUserscriptLibrary # cross-source plugin id
          source: https://stashapp.github.io/CommunityScripts/stable/index.yml # cross-source plugin source url
        - id: TetraxUserscriptLibrary # cross-source plugin id
          source: https://tetrax-10.github.io/stash-stuffs/index.yml # cross-source plugin source url
```

</br>

## Cli Docs

<table>
  <tr align="center">
    <td><b>Args</b></td>
    <td><b>Full args</b></td>
    <td><b>Description</b></td>
    <td><b>Default</b></td>
  </tr>
  <tr align="center">
    <td>-m</td>
    <td>--minify</td>
    <td align="left">minifies the code</td>
    <td align="left">present or not</td>
  </tr>
  <tr align="center">
    <td>-w</td>
    <td>--watch</td>
    <td align="left">watches for code change</td>
    <td align="left">present or not</td>
  </tr>
  <tr align="center">
    <td>-o</td>
    <td>--out</td>
    <td align="left">output folder</td>
    <td align="left">your stash plugins folder</td>
  </tr>
  <tr align="center">
    <td>-j</td>
    <td>--js</td>
    <td align="left">main JS file path</td>
    <td align="left">main JS file path from settings.yml</td>
  </tr>
  <tr align="center">
    <td>-c</td>
    <td>--css</td>
    <td align="left">main CSS file path</td>
    <td align="left">main CSS file path from settings.yml</td>
  </tr>
</table>

</br>

## Credits

Inspired from [spicetify-creator](https://github.com/spicetify/spicetify-creator) by [@FlafyDev](https://github.com/FlafyDev)
