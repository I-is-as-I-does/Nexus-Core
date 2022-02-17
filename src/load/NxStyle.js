/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { loadCss, pageHasSheet } from '@i-is-as-i-does/jack-js/src/modules/Web.js'
import { logErr } from '../logs/NxLog.js'
import { defaultSignatureRule, defaultStyle } from '../base/NxDefaults.js'

export function loadAppCss (url = null, signatureRule = null, fallbackUrl = null) {
  if (!url) {
    url = defaultStyle
  }
  if (!signatureRule) {
    signatureRule = defaultSignatureRule
  }
  if (!fallbackUrl && url !== defaultStyle) {
    fallbackUrl = defaultStyle
  }
  return loadCss(signatureRule, url)
    .then(() => {
      return Promise.resolve(url)
    }).catch((err) => {
      logErr('Theme not found', err.message)
      if (fallbackUrl) {
        return loadAppCss(fallbackUrl)
      } else {
        return Promise.reject(new Error(404))
      }
    })
}

export function isCssLoaded (url = null, signatureRule = null) {
  if (!url) {
    url = defaultStyle
  }
  if (!signatureRule) {
    signatureRule = defaultSignatureRule
  }
  return pageHasSheet(signatureRule, defaultStyle)
}
