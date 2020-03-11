const fs = require('fs');

// 删除文件
function deleteFile(pathFile, callBack) {
    if (fs.existsSync(pathFile)) {
        fs.unlink(pathFile, function(err) {
            if (callBack && typeof callBack === 'function') callBack(err)
        })
    }
}

module.exports = deleteFile
