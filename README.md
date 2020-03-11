# Install
```
npm i -D extract-less-vars-selector
```
# Usage
## Example for webpack.config.js
```js
var path = require('path');
var extractLessVarsSelctor = require('extract-less-vars-selector');
const MergeLess = require('extract-less-vars-selector/src/mergeLess.js')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.less/,
      use: [{
          loader: 'style-loader'
        },
        {
          loader: 'css-loader'
        },
        {
          loader: 'less-loader',
          options: {
            strictMath: true,
            noIeCompat: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            plugins: [
              new extractLessVarsSelctor({
                handleImportLess: true,
                output: path.resolve(__dirname, './theme'),
                webpackConfigPath: path.resolve(__dirname, './webpack.config.js')
              })
            ]
          }
        }
      ]
    }]
  },
  plugins: [
    new MergeLess({
      path: path.resolve(__dirname, './theme')
    })
  ]
};
```
## Example for vue.config.js
```js
var path = require('path');
var extractLessVarsSelctor = require('extract-less-vars-selector');

module.exports = {
  chainWebpack: config => {
    config.module
      .rule('extractLessVarsSelctor')
      .test(/\.less$/)
      .include
      .end()
      .use('postcss')
      .loader('postcss-loader')
      .options({
        plugins: [
          new extractLessVarsSelctor({
            handleImportLess: true,
            reverse: false,
            output: path.resolve(__dirname, './theme'),
            webpackConfigPath: path.resolve(__dirname, './webpack.config.js')
          })
        ]
      })
      .end()

    config.plugins.push(new MergeLess({
      path: path.resolve(__dirname, './theme')
    }))
  }
}
```
# Options

|Name|Type|Default|Description|
| --- | --- | --- | --- |
|output| string | -- | Path to create a less file. No setting, no output |
|outputMD5Name| boolean | false | md5 file name |
|handleImportLess| boolean | false | Whether to process less files introduced in less files |
| webpackConfigPath | string | -- | Get webpack alias name to resolve import file's true path |

# Example
## Before postcss-loader
```
├──src
│   ├──global
│   │   ├── global.less
│   ├── index.less
│   ├── index.js
```

```js
/** src/index.js **/
import styles from './index.less';
// do something
...
```

```css
/** src/global/global.less **/
@primary-color: red;
@text-color: blue;
@font-size: 14px;
@background-color: #ddd;

h5 {
  color: #fff;
}
table {
  background-color: @background-color;
}
```
```css
/** src/index.less **/

@import './global/global.less';

.text-color {
  border: 1px solid #ddd;
  background: green;
  color: @primary-color;
  font-size: @font-size;
  span {
    color: @text-color;
    font-size: 16px;
  }
  h1 {
    text-align: right;
  }
}
div {
  color: @text-color;
}
```
## After postcss-loader
```
├──src
│   ├──global
│   │   ├── global.less
│   ├── index.less
│   ├── index.js
├──theme
│   ├──-src-index.less.less
│   ├──theme.less
```
```css
/* src/theme/-src-index.less.less.less */
table { background-color: @background-color; }
.text-color { color: @primary-color; font-size: @font-size; }
.text-color span { color: @text-color; }
div { color: @text-color; }

```

```css
/* src/theme/theme.less */

/** -src-index.less.less **/
table { background-color: @background-color; }
.text-color { color: @primary-color; font-size: @font-size; }
.text-color span { color: @text-color; }
div { color: @text-color; }

```
