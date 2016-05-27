let fs = require('fs')

let stateFilePath = __dirname + '/state.json' 

module.exports = {
    getStateFilePath,
    setStateFilePath,
    write
}

function write(state) {
    fs.writeFileSync(
        stateFilePath,
        JSON.stringify(state)
    )
}

function getStateFilePath() {
    return stateFilePath
}

function setStateFilePath(filePath) {
    stateFilePath = filePath
}