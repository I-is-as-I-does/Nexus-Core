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
  loadTranslator: false,
  forceLang: null,
  forceStyle: null,
  customSignatureRule: null,
  forceId: null,
  extendedData: true
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

export function processRequest (nxelm, loadTranslator = false, forceLang = null) {
  var request = getRequest(nxelm)

  if (loadTranslator) {
    var lang = request.lang
    if (forceLang) {
      lang = forceLang
    }
    return import('../transl/NxCoreTranslate.js')
      .then((NxCoreTranslate) => {
        NxCoreTranslate.setOriginLang(lang)
        return request
      })
  }

  return Promise.resolve(request)
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

export function processFirstView (request, viewstore, forceId = null) {
  if (request.id) {
    var ids = [forceId, request.id]
    for (var i = 0; i < 2; i++) {
      var index = viewstore.list.indexOf(request.url + '#' + ids[i])
      if (index !== -1) {
        return viewstore.views.threads[index]
      }
    }
  }
  return viewstore.views.author
}

export function extendInitData (seed) {
  return import('../data/NxViews.js').then((NxViews) => {
    seed.viewstore = NxViews.authorAndThreadsViews(seed.nxdata, seed.request.url)
    seed.firstview = processFirstView(seed.request, seed.viewstore, seed.options.forceId)
    NxViews.addViewToHistory(seed.firstview.src, true)
    return seed
  })
}

export function initAll (options = {}) {
  var seed = {}
  seed.options = Object.assign({}, defaultInitOptions, options)
  setCookie()
  initLogger(seed.options.forceLog)
  seed.nxelm = retrieveNxElm(seed.options.customSelector)
  return processRequest(seed.nxelm, seed.options.loadTranslator, seed.options.forceLang).then(request => {
    seed.request = request

    return resolveTheme(seed.request, seed.options.cssSignatureRule).then(() => {
      return resolveData(seed.request)
    }).then(nxdata => {
      seed.nxdata = nxdata

      if (seed.options.extendedData) {
        return extendInitData(seed)
      }

      return seed
    }).catch(err => {
      var msg = err.message
      if (!Number.isInteger(msg)) {
        logErr('Nexus Init Failed', msg)
        msg = 400
      }
      throw new Error(msg)
    })
  })
}
