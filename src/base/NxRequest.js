/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { isValidHttpUrl } from '@i-is-as-i-does/jack-js/src/modules/Web.js'
import { splitUrlAndId, isValidId } from '../validt/NxStamper.js'
import { defaultLang, defaultStyle } from './NxDefaults.js'
import { getAbsoluteUrl, getQuery, currentUrl } from './NxHost.js'

export const splitCurrentUrl = splitUrlAndId(currentUrl)
export const appModes = ['reader', 'editor']

function solveUrlAndId(request, dataset){
  if(dataset){
    if (dataset.src) {
      var split = splitUrlAndId(getAbsoluteUrl(dataset.src))
  
      if (split.url) {
        request.url = split.url
        request.id = split.id
      }
    }
    if (dataset.id && isValidId(dataset.id)) {
      request.id = dataset.id // @doc: id specified in data-id trumps id contained in src url; legacy support
    }
  }

  if (splitCurrentUrl.id) {
    request.id = splitCurrentUrl.id // @doc: id specified in url trumps all
  }
}

function solveStyle(request, dataset, appDefaultCssAliases){
    if (dataset && dataset.style && dataset.style !== request.style && !appDefaultCssAliases.includes(dataset.style)) {
      var cssUrl = getAbsoluteUrl(dataset.style)
      if (isValidHttpUrl(cssUrl)) {
        request.style = cssUrl
      }
    }
}

function solveMode(request, dataset){
  if((dataset && dataset.mode && dataset.mode === 'editor') || getQuery('edit') || getQuery('new')){
    request.mode = 'editor'
  }
}


export function getRequest (NxElm, appDefaultCss = null, appDefaultCssAliases = [], appDefaultLang = null) {
  if(!appDefaultCss){
    appDefaultCss = defaultStyle
  }
  if(!appDefaultLang){
    appDefaultLang = defaultLang
  }
  var request = {
    srcdoc: null,
    url: '',
    id: '',
    style: appDefaultCss,
    lang: appDefaultLang,
    mode: 'reader'
  }
  var dataset = null
  if (NxElm && NxElm.dataset) {
    dataset = NxElm.dataset
    if (dataset.lang) {
      request.lang = dataset.lang
    }
    if(dataset.srcdoc){
      request.srcdoc = dataset.srcdoc
    } 
    solveStyle(request, dataset, appDefaultCssAliases)
  }
  solveUrlAndId(request, dataset)
  solveMode(request, dataset)

  return request
}
