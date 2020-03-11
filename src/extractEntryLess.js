const getParentSelector = require('./getParentSelector');
const parseLessTree = require('./parseLessTree');
const deleteFile = require('./deleteFile');
const writeFile = require('./writeFile');
const md5 = require('js-md5');
const fs = require('fs');
const path = require('path');

async function extractEntryLess(root, opts, md5FileMap) {
   const { winPlatForm, pathSplit, output, outputMD5Name } = opts;
   if (!output) return
   var tree = [];
   var alreadyImport = {};
   var path = opts.output || '';
   // create file name
   var outputName = root.source.input.file.replace(process.cwd(), '').split(pathSplit).join('-');
   var trueFileName = outputName;
   if (outputMD5Name) outputName = md5(trueFileName)

   await parseLessTree(root, tree, opts, alreadyImport)

   var lessTemplate = '';
   tree.forEach(item => {
     if (item.children.length > 0) lessTemplate += item.selector + ' { ' + item.children.join(' ') + ' }\n'
   })
   // 写文件，读取文件目录
   var pathFile = output + '/' + outputName + '.less';

   if (lessTemplate.length > 0) {
       if (!fs.existsSync(output)) fs.mkdirSync(output)
       var md5Str = md5(lessTemplate);
       if (md5FileMap[trueFileName] !== md5Str) {
          writeFile(pathFile, lessTemplate, () => {
              md5FileMap[trueFileName] = md5Str
          })
       }
   } else {
       // 上一次编译存在 但这一次less的文件内容为空，做删除操作
       deleteFile(pathFile, err => {
          if (!err && md5FileMap[trueFileName]) delete md5FileMap[trueFileName]
       })
   }
}

module.exports = extractEntryLess
