const fs = require('fs');
const path = require('path');
const md5 = require('js-md5');
const writeFile = require('./writeFile');
const deleteFile = require('./deleteFile');

function MergeLess({
  path = '',
  lessName = 'theme.less'
}) {
  this.path = path;
  this.lessName = lessName
}

MergeLess.prototype.apply = function(compiler) {
  let allStrMd5 = ''
  compiler.plugin('done', () => {
    var all = ''
    fs.readdir(this.path, (err, file) => {
      if (err) return (file || []).forEach(name => {
        // 排除自身
        if (name === this.lessName) return
        var filePath = path.resolve(path.join(this.path), name);
        str = fs.readFileSync(filePath, 'utf-8')
        all = all + '/** ' + name + ' **/' + '\n' + str + '\n'
      })
      if (all.length > 0) {
        var currentMD5 = md5(all)
        var allFilePath = path.resolve(path.join(this.path), this.lessName)
        var exists = fs.existsSync(allFilePath)
        if (exists) deleteFile(allFilePath)
        if (currentMD5 !== allStrMd5) {
          writeFile(allFilePath, all, () => {
            allStrMd5 = currentMD5
          })
        }
      }
    })
  });
};

module.exports = MergeLess;
