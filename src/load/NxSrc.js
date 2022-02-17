/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { loadJson } from '@i-is-as-i-does/jack-js/src/modules/Web.js'
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

export function loadSrc (url, lax = false) {
  // @doc: src should not contain #id
  return loadJson(url)
    .then((nxdata) => {
      nxdata = validData(nxdata, lax)

      if (nxdata) {
        if(!lax){
          registerData(url, nxdata)
        }
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

export function getSrcDocData(jsonData, lax = false) {
  var nxdata = null
  try {
    var nxdata = JSON.parse(jsonData)
    if(nxdata){
      nxdata = validData(nxdata, lax)
    }
    if(!nxdata){
      throw new Error('Invalid Nexus data')
    }
} catch (err) {
  logErr('Invalid source', err.message)
}
return nxdata
}

export function loadSrcFile (inputEvt, lax = false) {
  if (inputEvt.target.files.length) {
    if (inputEvt.target.files[0].type === 'application/json') {
      return new Promise((resolve, reject) => {
        var reader = new FileReader()
        reader.onload = function (event) {
          var nxdata = getSrcDocData(event.target.result, lax)
          if (nxdata) {
            resolve(nxdata)
          } else {
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

export function getSrcData (url, lax = false) {
  // @doc: url should not contain #id
  var nxdata = getStoredData(url)
  if (nxdata !== null) {
    if (Number.isInteger(nxdata)) {
      return Promise.reject(new Error(nxdata))
    }
    return Promise.resolve(nxdata)
  }
  return loadSrc(url, lax)
}
