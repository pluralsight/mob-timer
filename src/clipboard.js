const clipboardy = require('clipboardy')

module.exports = {
  clearClipboardHistory(numberOfItemsHistoryStores) {
    const millisecondsNeededBetweenWrites = 180
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
