/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */

import { toLastSlash } from '@i-is-as-i-does/jack-js/src/modules/Web'
import { splitUrlAndId } from '../validt/NxStamper.js'

export const currentUrl = window.location.href
export const baseCurrentUrl = toLastSlash(currentUrl)
export const splitCurrentUrl = splitUrlAndId(currentUrl)
export const queries = new URLSearchParams(window.location.search.slice(1))

export function getQuery (key) {
  return queries.has(key)
}
export function getAbsoluteUrl (url) {
  if (url.length && url.substring(0, 4) !== 'http') {
    return baseCurrentUrl + url.replace(/^\.?\/?/, '')
  }
  return url
}
