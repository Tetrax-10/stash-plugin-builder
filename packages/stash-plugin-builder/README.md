# stash-plugin-builder

Build stash plugins with React, SCSS and other libraries with TS support

### Usage

##### 1. Generate boilerplate using [create-stash-plugin](https://github.com/Tetrax-10/create-stash-plugin)

```sh
npx create-stash-plugin
```

##### 2. Build plugin

`cd` to the generated plugin folder and run

```sh
npm run build
```

The plugin should be built in your `stash plugins folder`. Refresh your stash localhost, and the plugin should be listed in the `Plugins tab`. If not, try clicking `Reload plugins` button.

##### 3. Watch plugin

Run this npm command and reload your `stash localhost` just once to connect `stash-plugin-builder` and stash

```sh
npm run watch
```

Just saving the file will auto build and reload your stash localhost website

##### 4. Build plugin for distribution

```sh
npm run build-dist
```

This will build the plugin and output the distributable plugin to the `dist` folder. You can change this folder in `package.json`.
