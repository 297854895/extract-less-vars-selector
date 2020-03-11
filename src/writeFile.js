const fs = require('fs');

function writeFile(pathFile, lessTemplate, callBack) {
    if (fs.existsSync(pathFile)) {
       fs.unlink(pathFile, function(err) {
          if (!err) {
              fs.writeFileSync(pathFile, lessTemplate)
              if (callBack && typeof callBack === 'function') callBack()
          }
       })
    } else {
       fs.writeFileSync(pathFile, lessTemplate)
       if (callBack && typeof callBack === 'function') callBack()
    }
}

module.exports = writeFile
