/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */

import { loadAppCss } from './NxStyle.js'
import { logErr, setConsoleLog } from '../logs/NxLog.js'
import { getRequest } from '../base/NxRequest.js'
import { getQuery } from '../base/NxHost.js'
import { getSrcData } from './NxSrc.js'
import { defaultElmId } from './../base/NxDefaults.js'

export const defaultInitOptions = {
  customSelector: null,
  forceLog: false,
  forceStyle: null,
  customSignatureRule: null
}

export function setCookie () {
  document.cookie = 'Nx=Instance; SameSite=None; Secure'
}

export function initLogger (forceLog = false) {
  if (forceLog || getQuery('log')) {
    setConsoleLog(true)
  }
}

export function retrieveNxElm (customSelector = null) {
  var selectors = [defaultElmId]
  if (customSelector && customSelector !== defaultElmId) {
    selectors.unshift(customSelector)
  }
  var elm
  for (var s = 0; s < 2; s++) {
    elm = document.querySelector(selectors[s])
    if (elm) {
      return elm
    }
  }
  elm = document.createElement('DIV')
  elm.id = defaultElmId

  return elm
}

export function resolveTheme (request, forceStyle = null, signatureRule = null) {
  var url = request.style
  var fallbackUrl = null
  if (forceStyle) {
    url = forceStyle
    fallbackUrl = request.style
  }
  return loadAppCss(url, signatureRule, fallbackUrl)
}

export function resolveData (request) {
  if (request.url) {
    return getSrcData(request.url).then(nxdata => {
      return nxdata
    })
  }
  return Promise.reject(new Error(0))
}


export function initAll (options = {}) {
  var seed = {}
  seed.options = Object.assign({}, defaultInitOptions, options)
  setCookie()
  initLogger(seed.options.forceLog)
  seed.nxelm = retrieveNxElm(seed.options.customSelector)
  seed.request = getRequest(nxelm)
    return resolveTheme(seed.request, seed.options.cssSignatureRule).then(() => {
      return resolveData(seed.request)
    }).then(nxdata => {
      seed.nxdata = nxdata
      return seed
    }).catch(err => {
      var msg = err.message
      if (!Number.isInteger(msg)) {
        logErr('Nexus Init Failed', msg)
        msg = 400
      }
      throw new Error(msg)
    })
}
