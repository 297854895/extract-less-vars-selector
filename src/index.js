var syntax = require('postcss-less');
var postcss = require('postcss');
var fs = require('fs');

var pluginName = 'extract-less-vars-selector';

var extractLessVarsSelector = postcss.plugin(pluginName, function(opts) {
  return (root) => extractLess(root, opts)
})

var getWholeParentSelector = function(rule) {
  if (!rule.selector) return ''
  var parentSelector = getWholeParentSelector(rule.parent)
  if (!parentSelector) return rule.selector
  return parentSelector + ' ' + rule.selector
}

// webpack postcss-loader直接处理vue、js、jsx、tsx 中引进的less
async function extractLess(root, opts) {
  opts = Object.assign({
    // 输出目录
    output: '',
    // webpack配置路径
    webpackConfigPath: '',
    // 是否处理引入的less文件
    handleImportLess: false,
    // 结果反序
    reverse: false,
    // 获得生成后的数组结果
    result: null,
    // 生成的文件名
    fileName: 'theme.less'
  }, opts)
  // || __dirname.replace('/node_modules/' + pluginName, '')
  var path = opts.output || '';
  var tree = [];
  // 防止重复处理，已路径为标识缓存
  var alreadyImport = {};
  if (opts.handleImportLess) await extractImportLess(root.source, tree, opts, alreadyImport);
  root.walkRules(function(rule) {
    var parentSelector = getWholeParentSelector(rule.parent)
    var selector = (parentSelector ? parentSelector + ' ' : '') + rule.selector
    var children = []
    tree.push({
      selector,
      children
    })
    let currentSelector = rule.selector
    rule.walkDecls(function(decl) {
      // 排除非变量属性
      if (decl.value.indexOf('@') > -1 && decl.parent.selector === currentSelector) {
        children.push(decl.prop + ': ' + decl.value + ';')
      }
    })
  })
  if (opts.result && typeof opts.result === 'function') opts.result(tree)
  // 不需要生成文件
  if (!path) return
  var lessTemplate = '';
  // 反序
  if (opts.reverse) tree.reverse();
  tree.forEach(item => {
    if (item.children.length > 0) lessTemplate += item.selector + ' { ' + item.children.join(' ') + ' }\n'
  })
  // 写文件，读取文件目录
  if (lessTemplate.length > 0) {
    if (!fs.existsSync(path)) fs.mkdirSync(path)
    var pathFile = path + '/' + opts.fileName
    if (fs.existsSync(pathFile)) {
      fs.unlink(pathFile, function(err) {
        if (!err) fs.writeFileSync(pathFile, lessTemplate)
      })
    } else {
      fs.writeFileSync(pathFile, lessTemplate)
    }
  }
}
// 遍历import进的less树
async function parseLessTree(root, tree, opts, alreadyImport) {
  if (opts.handleImportLess) await extractImportLess(root.source, tree, opts, alreadyImport);

  root.walkRules(function(rule) {
    var parentSelector = getWholeParentSelector(rule.parent)
    var selector = (parentSelector ? parentSelector + ' ' : '') + rule.selector
    var children = []
    tree.push({
      selector,
      children
    })
    let currentSelector = rule.selector
    rule.walkDecls(function(decl) {
      // 排除非变量属性
      if (decl.value.indexOf('@') > -1 && decl.parent.selector === currentSelector) children.push(decl.prop + ': ' + decl.value + ';')
    })
  })
}
// 处理import进的less文件
async function extractImportLess(root, tree, opts, alreadyImport) {
  var {
    input: {
      css,
      file
    }
  } = root

  return new Promise(async resolve => {
    if (!css) return resolve()
    var winPlatForm = /^win/.test(process.platform);
    var pathSplit = winPlatForm ? '\\' : '/';
    var fileArr = file.split(pathSplit)
    fileArr.pop()
    var filePath = fileArr.join(pathSplit);

    var importReg = new RegExp(/@import\s+('|").+.less('|");/g)
    var needExtractLessArr = css.match(importReg) || []

    if (needExtractLessArr.length < 1) return resolve()

    var webpackConfig = require(opts.webpackConfigPath)
    if (!webpackConfig) return resolve()
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
            if (turnLevel.length < turnLevel) {
              console.error('resolve ' + item + ' error, path does not exist')
              return resolve()
            }
            filePathArr.length -= turnLevel
            importPath = filePathArr.join(pathSplit) + importPath.replace(/..\//g, pathSplit)
          }
        }
      }
      if (!importPath) {
        console.error('path does not exist');
        return resolve()
      }
      if (!alreadyImport[importPath]) {
        var less = fs.readFileSync(importPath)
        if (!less) {
          console.error('read ' + importPath + ' error ')
          return resolve()
        }
        less = less.toString()
        if (less.length <= 0) return resolve()
        // console.log('\n' + css);
        const result = await postcss([])
          .process(less, {
            parser: false,
            from: importPath,
            syntax
          });
        // 防止重复处理，已路径为标识缓存
        alreadyImport[importPath] = true
        await parseLessTree(result.root, tree, opts, alreadyImport)
      }
      if (idx === needExtractLessArr.length - 1) resolve()
    })
  })
}

module.exports = extractLessVarsSelector
