/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */

import { loadAppCss } from './NxStyle.js'
import { logErr, setConsoleLog } from '../logs/NxLog.js'
import { getRequest } from '../base/NxRequest.js'
import { getQuery } from '../base/NxHost.js'
import { getSrcData, getSrcDocData } from './NxSrc.js'
import { defaultElmId } from '../base/NxDefaults.js'
import { eraseReaderSaves, clearReaderCache } from '../storg/NxMemory.js'

export const defaultInitOptions = {
  customSelector: null,
  forceLog: false,
  forceStyle: null,
  customSignatureRule: null,
  appDefaultCss: null, 
  appDefaultCssAliases: [],
  appDefaultLang: null
}

export function checkCacheRequests(){
  if(getQuery('clear')){
    clearReaderCache()
  }
 if(getQuery('erase')){
  eraseReaderSaves()
  }
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

export function resolveTheme (request, fallbackCssUrl = null, forceStyle = null, customSignatureRule = null) {
  var url = request.style
  if (forceStyle) {
    url = forceStyle
    if(!fallbackCssUrl || fallbackCssUrl === forceStyle){
      fallbackCssUrl = request.style
    } 
  } else if(fallbackCssUrl === url){
    fallbackCssUrl = null
  }
  return loadAppCss(url, customSignatureRule, fallbackCssUrl)
}

export function resolveData (request) {
  if(request.srcdoc){
    var nxdata = getSrcDocData(request.srcdoc, request.mode === 'editor')
    if(nxdata){
      return Promise.resolve(nxdata)
    }
  }
  if (request.url) {
    return getSrcData(request.url)
  }
  return Promise.reject(new Error(0))
}

export function initAll (options = {}) {
  var seed = {}
  seed.options = Object.assign({}, defaultInitOptions, options)
  checkCacheRequests()
  setCookie()
  initLogger(seed.options.forceLog)
  seed.nxelm = retrieveNxElm(seed.options.customSelector)
  seed.request = getRequest(seed.nxelm, seed.options.appDefaultCss, seed.options.appDefaultCssAliases, seed.options.appDefaultLang)
    return resolveTheme(seed.request, seed.options.appDefaultCss, seed.options.forceStyle, seed.options.customSignatureRule)
    .then((styleUrl) => {
      seed.styleUrl = styleUrl
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
