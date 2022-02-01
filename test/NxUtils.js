/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
var time = 800

export function resetTimer (initialValue = 800) {
  time = initialValue
}
export function testSlowResponses (callback, increment = 400, reset = false, resetValue = 800) {
  if (reset) {
    resetTimer(resetValue)
  }
  time = time + increment
  setTimeout(function () {
    callback()
  }, time)
}
