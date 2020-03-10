# extract-less-vars-selector
# Install
```
npm i -D extract-less-vars-selector
```
# Usage
## Example for webpack.config.js
```js
var path = require('path');
var extractLessVarsSelctor = require('extract-less-vars-selector');

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
                reverse: false,
                output: path.resolve(__dirname, './theme'),
                webpackConfigPath: path.resolve(__dirname, './webpack.config.js')
              })
            ]
          }
        }
      ]
    }]
  }
};
```
## Example for postcss-loader options
```js
var path = require('path')

module.exports = ({
  file,
  options,
  env
}) => ({
  parser: file.extname === '.sss' ? 'sugarss' : false,
  plugins: {
    'postcss-import': {
      root: file.dirname
    },
    'postcss-preset-env': options['postcss-preset-env'] ? options['postcss-preset-env'] : false,
    'cssnano': env === 'production' ? options.cssnano : false,
    'extract-less-vars-selector': {
      handleImportLess: true,
      reverse: false,
      output: path.resolve(__dirname, './theme'),
      webpackConfigPath: path.resolve(__dirname, './webpack.config.js')
    }
  }
})
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
  }
}
```
# Options

|Name|Type|Default|Description|
| --- | --- | --- | --- |
| result | function | null | Return result array |
|reverse| boolean | false | Reverse result |
|output| string | -- | Path to create a less file. No setting, no output |
|fileName| string | theme.less | Output less fine name |
|handleImportLess| boolean | false | Whether to process less files introduced in less files |
| webpackConfigPath | string | -- | Get webpack alias name to resolve import file's true path |