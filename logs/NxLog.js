/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */

var errors = []
var consoleLog = false

export function setConsoleLog (bool = true) {
  consoleLog = bool
}
export function clearErr () {
  errors = []
}

export function logErr (msg, detail = null) {
  var entry = { msg: msg }
  if (detail) {
    entry.detail = detail
  }
  errors.push(entry)
  if (consoleLog) {
    console.log('Nexus/Error: ' + JSON.stringify(entry))
  }
}

export function getErr () {
  return errors
}
