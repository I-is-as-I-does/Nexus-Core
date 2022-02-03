/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */

import { getStoredItem, removeItem, storeItem } from './NxStorage.js'

var visitStore = {}
var dataStore = {}
var linkedStore = {}

var oembedStore = {}
const editpsrcix = 'nx-edit#'

function threadLastSeenDate (src) {
  return getStoredItem(src, 'local', visitStore)
}

export function registerEditData (url, nxdata) {
  storeItem(editpsrcix + url, nxdata, 'local')
}

export function getStoredEditData (url) {
  return getStoredItem(editpsrcix + url, 'local')
}

export function registerThreadVisit (src, timestamp) {
  if (!Object.prototype.hasOwnProperty.call(visitStore, src)) {
    storeItem(src, timestamp, 'local', visitStore)
  }
}

export function isThreadContentUnseen (src, timestamp) {
  var lastKnownDate = threadLastSeenDate(src)

  if (!lastKnownDate) {
    return true
  }
  if (timestamp && lastKnownDate !== timestamp) {
    return true
  }
  return false
}

export function clearData (url) {
  removeItem(url, 'session', dataStore)
}

export function registerData (url, nxdata) {
  storeItem(url, nxdata, 'session', dataStore)
}

export function registerLinkedMaps (src, map) {
  storeItem(src + ':linked', map, 'session', linkedStore)
}

export function getStoredLinkedMaps (src) {
  return getStoredItem(src + ':linked', 'session', linkedStore)
}

export function getStoredData (url) {
  return getStoredItem(url, 'session', dataStore)
}

export function registerOembedResponse (givenUrl, response) {
  storeItem(givenUrl, response, 'local', oembedStore)
}

export function getStoredOembedResponse (givenUrl) {
  return getStoredItem(givenUrl, 'local', oembedStore)
}

export function setStoredLang (lang) {
  storeItem('nx-lang', lang, 'local')
}
export function getStoredLang () {
  return getStoredItem('nx-lang', 'local')
}
