/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { loadJson } from '@i-is-as-i-does/jack-js/src/modules/Web'
import { logErr } from '../logs/NxLog.js'
import { getStoredData, registerData } from '../storg/NxMemory.js'
import { validData } from '../validt/NxStamper.js'

export function getThreadsList (nxdata) {
  var list = []
  nxdata.threads.forEach((thread) => {
    list.push(thread.id)
  })
  return list
}

export function loadSrc (url) {
  // @doc: src should not contain #id
  return loadJson(url)

    .then((nxdata) => {
      nxdata = validData(nxdata)

      if (nxdata) {
        registerData(url, nxdata)
        return nxdata
      }
      logErr('Invalid source', url)
      return Promise.reject(new Error(400))
    })
    .catch((err) => {
      var code = 400
      if (err.message !== 400) {
        code = 404
        logErr('No response', err.message)
      }
      registerData(url, code)
      return Promise.reject(new Error(code))
    })
}

export function prcFileSrc (readerEvent) {
  var nxdata = JSON.parse(readerEvent.target.result)
  if (nxdata) {
    nxdata = validData(nxdata)
    if (nxdata) {
      return nxdata
    }
  }
  return false
}

export function loadSrcFile (inputEvt) {
  if (inputEvt.target.files.length) {
    if (inputEvt.target.files[0].type === 'application/json') {
      return new Promise((resolve, reject) => {
        var reader = new FileReader()
        reader.onload = function (event) {
          var nxdata = prcFileSrc(event)
          if (nxdata) {
            resolve(nxdata)
          } else {
            logErr('Invalid source', inputEvt.target.files[0])
            reject(new Error(400))
          }
        }
        return reader.readAsText(inputEvt.target.files[0])
      })
    }
    logErr('Invalid file type', inputEvt.target.files[0])
    return Promise.reject(new Error(400))
  }
  logErr('No file selected')
  return Promise.reject(new Error(400))
}

export function getSrcData (url) {
  // @doc: url should not contain #id
  var nxdata = getStoredData(url)
  if (nxdata !== null) {
    if (Number.isInteger(nxdata)) {
      return Promise.reject(new Error(nxdata))
    }
    return Promise.resolve(nxdata)
  }
  return loadSrc(url)
}
