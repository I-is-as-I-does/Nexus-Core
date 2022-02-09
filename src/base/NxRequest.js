/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { isValidHttpUrl } from '@i-is-as-i-does/jack-js/src/modules/Web'
import { splitUrlAndId, isValidId } from '../validt/NxStamper.js'
import { defaultLang, defaultStyle } from './NxDefaults.js'
import { getAbsoluteUrl, splitCurrentUrl } from './NxHost.js'

export function getRequest (NxElm, appDefaultCss = null, appDefaultCssAliases = [], appDefaultLang = null) {
  if(!appDefaultCss){
    appDefaultCss = defaultStyle
  }
  if(!appDefaultLang){
    appDefaultLang = defaultLang
  }
  var request = {
    url: null,
    id: '',
    style: appDefaultCss,
    lang: appDefaultLang
  }

  if (NxElm && NxElm.dataset) {
    if (NxElm.dataset.src) {
      var split = splitUrlAndId(getAbsoluteUrl(NxElm.dataset.src))

      if (split.url) {
        request.url = split.url
        request.id = split.id
      }
    }
    if (NxElm.dataset.id && isValidId(NxElm.dataset.id)) {
      request.id = NxElm.dataset.id // @doc: id specified in data-id trumps id contained in src url
    }
    if (NxElm.dataset.style && NxElm.dataset.style !== request.style && !appDefaultCssAliases.includes(NxElm.dataset.style)) {
      var cssUrl = getAbsoluteUrl(NxElm.dataset.style)
      if (isValidHttpUrl(cssUrl)) {
        request.style = cssUrl
      }
    }
    if (NxElm.dataset.lang) {
      request.lang = NxElm.dataset.lang
    }
  }
  if (splitCurrentUrl.id) {
    request.id = splitCurrentUrl.id // @doc: id specified in url trumps all
  }
  return request
}
