const comment = require('postcss-comment');
const syntax = require('postcss-less');
const postcss = require('postcss');
const fs = require('fs');

// const parseLessTree = require('./parseLessTree');

// handle with @import less file
function parseImportLess(root, tree, opts, alreadyImport) {
  let {
    input: {
      css,
      file
    }
  } = root;

  const {
    // winPlatForm,
    pathSplit
  } = opts

  return new Promise(async (resolve, reject) => {
    if (!css) return resolve()
    var fileArr = file.split(pathSplit)
    fileArr.pop();
    var filePath = fileArr.join(pathSplit);
    // remove comment @import less
    css = css.replace(/\/\/\s*@import\s+('|").+.less('|");/g, '');
    css = css.replace(/\/\*+\s*@import\s+('|").+.less('|")\s*;*\s*\*+\//g, '');
    var importReg = new RegExp(/@import\s+('|").+.less('|");/g)
    var needExtractLessArr = css.match(importReg) || []
    if (needExtractLessArr.length < 1) return resolve()

    var webpackConfig = require(opts.webpackConfigPath)
    if (!webpackConfig) return reject('can not find webpack.config')
    var aliasMap = webpackConfig ? webpackConfig.resolve ? (webpackConfig.resolve.alias || {}) : {} : {}
    needExtractLessArr.forEach(async (item, idx) => {
      // 获取全路径
      var importPath = item.replace(/@import\s+('|")/, '').replace(/('|");/, '')
      // 针对less的import规则，需要alias映射补全
      if (importPath.indexOf('~') === 0) {
        for (let key in aliasMap) {
          // console.log(importPath.indexOf('~' + key));
          if (importPath.indexOf('~' + key) === 0) {
            importPath = aliasMap[key] + importPath.replace('~' + key, '')
            break;
          }
        }
      } else {
        // console.log(importPath);
        if (importPath.indexOf('./') === 0) {
          // 当前路径
          importPath = filePath + importPath.replace('./', pathSplit)
        } else {
          // 上下层级跳转 ../类似跳转文件目录
          var filePathArr = filePath.split(pathSplit)
          var turnLevel = importPath.split('../').length - 1
          if (turnLevel > 0) {
            if (filePathArr.length < turnLevel) {
              return reject('resolve ' + item + ' error, path does notexist')
            }
            filePathArr.length -= turnLevel
            importPath = filePathArr.join(pathSplit) + importPath.replace(/^\.\.\/(\.\.\/)*/, pathSplit)
          }
        }
      }
      if (!importPath) {
        return reject('path does not exist')
      }
      if (!alreadyImport[importPath]) {
        var less = fs.readFileSync(importPath)
        if (!less) {
          return reject('read ' + importPath + ' error')
        }
        less = less.toString()
        if (less.length <= 0) return resolve()
        // console.log('\n' + css);
        const result = await postcss([])
          .process(less, {
            parser: comment,
            from: importPath,
            syntax
          });
        // 防止重复处理，已路径为标识缓存
        alreadyImport[importPath] = true
        await require('./parseLessTree')(result.root, tree, opts, alreadyImport);
      }
      if (idx === needExtractLessArr.length - 1) resolve()
    })
  })
}

module.exports = parseImportLess
