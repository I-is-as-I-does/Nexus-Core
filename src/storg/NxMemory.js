/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */

import {
  clearBrowserStores,
  clearInstanceStores,
  getStoredItem,
  instStoreHasKey,
  removeItem,
  storeItem,
  walkLocalStore,
} from './NxStorage.js'

const editpsrcix = 'nx-edit#'

export function registerEditData(url, nxdata) {
  storeItem(editpsrcix + url, nxdata, 'local')
}

export function getStoredEditData(url) {
  return getStoredItem(editpsrcix + url, 'local')
}

export function registerThreadVisit(src, timestamp) {
  if (!instStoreHasKey('visit', src)) {
    storeItem(src, timestamp, 'local', 'visit')
  }
}

export function isThreadContentUnseen(src, timestamp) {
  var lastKnownDate = getStoredItem(src, 'local', 'visit')

  if (!lastKnownDate) {
    return true
  }
  if (timestamp && lastKnownDate !== timestamp) {
    return true
  }
  return false
}

export function clearData(url) {
  removeItem(url, 'session', 'data')
}

export function registerData(url, nxdata) {
  storeItem(url, nxdata, 'session', 'data')
}

export function registerLinkedMaps(src, map) {
  storeItem(src + ':linked', map, 'session', 'linked')
}

export function getStoredLinkedMaps(src) {
  return getStoredItem(src + ':linked', 'session', 'linked')
}

export function getStoredData(url) {
  return getStoredItem(url, 'session', 'data')
}

export function registerOembedResponse(givenUrl, response) {
  storeItem(givenUrl, response, 'local', 'oembed')
}

export function getStoredOembedResponse(givenUrl) {
  return getStoredItem(givenUrl, 'local', 'oembed')
}

export function setStoredLang(lang) {
  storeItem('nx-lang', lang, 'local')
}
export function getStoredLang() {
  return getStoredItem('nx-lang', 'local')
}

export function clearAllCache() {
  clearInstanceStores()
  clearBrowserStores()
}

export function eraseReaderSaves() {
  walkLocalStore(function(locStore, key){
    if (key.indexOf(editpsrcix) === 0) {
      locStore.removeItem(key)
    }
  })
}

export function clearReaderCache() {
  clearInstanceStores()
  clearBrowserStores('local')
  walkLocalStore(function(locStore, key){
    if (key.indexOf(editpsrcix) !== 0) {
      locStore.removeItem(key)
    }
  })
}
