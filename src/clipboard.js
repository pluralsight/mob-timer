const clipboardy = require('clipboardy')

module.exports = {
  clearClipboardHistory() {
    const millisecondsNeededBetweenWrites = 180
    const numberOfItemsHistoryStores = 25
    let i = 1
    let id = setInterval(writeToClipboard, millisecondsNeededBetweenWrites)

    function writeToClipboard() {
      if (i < numberOfItemsHistoryStores) {
        clipboardy.writeSync(i.toString())
        i++
      } else {
        clipboardy.writeSync('')
        clearInterval(id)
      }
    }
  }
}
