const extractEntryLess = require('./extractEntryLess');
const postcss = require('postcss');

const pluginName = 'extract-less-vars-selector';

const extractLessVarsSelector = postcss.plugin(pluginName, function(opts) {
    const md5FileMap = {};
    const winPlatForm = /^win/.test(process.platform)
    if (!opts.output) return () => {}
    return root => extractEntryLess(root, Object.assign({
      // output
      output: '',
      // webpack.config.js path
      webpackConfigPath: '',
      // whether to deal with import less
      handleImportLess: false,
      // name to md5
      outputMD5Name: false
    }, opts, {
      // platform
      winPlatForm,
      // file system split chart
      pathSplit: winPlatForm ? '\\' : '/'
    }), md5FileMap)
})

module.exports = extractLessVarsSelector
