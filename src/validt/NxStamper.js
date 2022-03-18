/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import {
  isEmpty,
  isNonEmptyObj,
  seemsLikeValidDate
} from '@i-is-as-i-does/jack-js/src/modules/Check.js'
import {
  charCut
} from '@i-is-as-i-does/jack-js/src/modules/Help.js'
import {
  isValidHttpUrl
} from '@i-is-as-i-does/jack-js/src/modules/Web.js'

import {
  charMinMax,
  itemsMinMax,
  appUrl,
  supportedMediaTypes,
  timestampPattern,
  idPattern,
  typesMap,
  fallbacks
} from './NxSpecs.js'
import { logErr } from '../logs/NxLog.js'
import { getAbsoluteUrl } from '../base/NxHost.js'

export function charLimits (catg) {
  if (Object.prototype.hasOwnProperty.call(charMinMax, catg)) {
    return charMinMax[catg]
  }
  logErr('Unknown characters limits category', catg)
  return false
}

export function itmLimits (catg) {
  if (Object.prototype.hasOwnProperty.call(itemsMinMax, catg)) {
    return itemsMinMax[catg]
  }
  logErr('Unknown items limits category', catg)
  return false
}

export function isValidMediaType (mediaType) {
  if (
    hasValidType(mediaType, 'type', true) &&
      supportedMediaTypes.includes(mediaType)
  ) {
    return true
  }

  logErr('Invalid media type', mediaType)
  return false
}

export function extendString (str, catg) {
  var limits = charLimits(catg)
  if (limits !== false) {
    var diff = limits[0] - str.length
    if (diff > 0) {
      var placeholder = '-'
      str = placeholder.repeat(diff) + str
    }
    return str
  }
  logErr('Unable to extend string', catg)
  return str
}

export function validLenghtStr (str, catg, nonEmpty = true) {
  if(str.length || nonEmpty){
  if (!strHasValidMinLength(str, catg)) {
      str = extendString(str, catg)
  } else if (!strHasValidMaxLength(str, catg)) {
    str = cutString(str, catg)
  }
}
  return str
}

export function hasValidType (item, field, nonEmpty = true) {
  if (Object.prototype.hasOwnProperty.call(typesMap, field)) {
    var type = typesMap[field]
    if (
      typeof item !== 'undefined' &&
        item !== null &&
        item.constructor.name === type
    ) {
      if (!nonEmpty || !isEmpty(item)) {
        return true
      }
      logErr('Field is empty', field)
    } else {
      logErr('Invalid field type', field)
    }
  } else {
    logErr('Unknown field', field)
  }

  return false
}

export function emptyMedia(){
return {
  url:'',
  type:'',
  caption:''
}
}

export function validMediaCaption(caption){
  if (caption && hasValidType(caption, 'caption', false)) {
    return validLenghtStr(caption, 'caption', false)
  }
  return ''
}

export function validMediaType(mediaType, hasMediaUrl){
  if(!hasMediaUrl){
    return ''
  }
  if(isValidMediaType(mediaType)){
    return mediaType
  }
  return fallbacks.type
}

export function validMedia (mediaObj, lax = false) {
  if (hasValidType(mediaObj, 'media', true)){
    var url = null
    if(isValidUrl(mediaObj.url, lax)){
      url = mediaObj.url
    } 
    if(url || lax){
      var type = validMediaType(mediaObj.type, url !== null)
      var caption = validMediaCaption(mediaObj.caption)
      if(type || caption){
        if(!url){
          url = fallbacks.url
        }
        return {
          url: url,
          type: type,
          caption: caption
        }
      }
    }
  }
  return emptyMedia()
}

export function isValidTimestamp (timestamp, strict = false) {
  if (timestamp &&
    hasValidType(timestamp, 'timestamp', true) &&
      (timestamp.match(timestampPattern) ||
        (!strict && seemsLikeValidDate(timestamp)))
  ) {
    return true
  }
  logErr('Invalid timestamp', timestamp)
  return false
}

export function fallbackContent(lax = false){
  if(lax){
    return {
      timestamp: fallbacks.timestamp,
      main: fallbacks.main,
      aside: '',
      media: emptyMedia()
    }
  } 
    return null
}

export function formatTimestamp(timestamp){
  if(!timestamp){
    return fallbacks.timestamp;
  }
  if(timestamp.match(timestampPattern+'$')){
      return timestamp
  }
    try {
      timestamp = new Date(timestamp).toISOString().split('T')[0]
    } catch (e){
      logErr('Invalid timestamp', timestamp)
      timestamp = fallbacks.timestamp
    }
  return timestamp
}

export function validTimestamp(timestamp, lax = false){
  if(isValidTimestamp (timestamp, false)){
    return formatTimestamp(timestamp)
  }
  if(lax){
    return fallbacks.timestamp
  }
  return null
}

export function validMainContent(main, lax = false){
  if(hasValidType(main, 'main', true)){
    return validLenghtStr(main, 'main', true)
  }
  if(lax){
    return fallbacks.main
  }
  return null
}

export function validAsideContent(aside){
  if(aside && hasValidType(aside,'aside', false)){
    return validLenghtStr(aside, 'aside', false)
  } 
    return '' 
}

export function validContent(content, lax = false) {
  if (!hasValidType(content, 'content', true)) {
    return fallbackContent(lax)
  }
  var timestamp = validTimestamp(content.timestamp, lax)
  if(!timestamp){
    return null
  }
  var main = validMainContent(content.main, lax)
  if(!main){
    return null
  }
  var c = {}
  c.timestamp = timestamp
  c.main = main
  c.aside = validAsideContent(content.aside)
  c.media = validMedia(content.media, lax)
  return c
}

export function cutString (item, catg) {
  var limits = charLimits(catg)
  if (limits !== false) {
    return charCut(item, limits[1])
  }
  logErr('Unable to cut string', catg)
  return ''
}

export function strHasValidMaxLength (item, catg) {
  var limits = charLimits(catg)
  if (limits !== false) {
    if (item.length <= limits[1]) {
      return true
    }
    logErr('Invalid max length', catg)
  }
  return false
}
export function strHasValidMinLength (item, catg) {
  var limits = charLimits(catg)
  if (limits !== false) {
    if (item.length >= limits[0]) {
      return true
    }
    logErr('Invalid min length', catg)
  }
  return false
}

export function hasValidLength (item, catg) {
  var limits = charLimits(catg)
  if (limits !== false) {
    if (item.length >= limits[0] && item.length <= limits[1]) {
      return true
    }
    logErr('Invalid length', catg)
  }
  return false
}

export function splitUrlAndId (url) {
  var rt = {
    url: null,
    id: ''
  }
  if (isValidHttpUrl(url)) {
    rt.url = url

    if (url.includes('#')) {
      var sp = url.split('#')
      var id = sp.pop()
      rt.url = sp.join('#')
      if (id && isValidId(id)) {
        rt.id = id
      }
    }
  }

  return rt
}

export function isValidId (id) {
  if (hasValidType(id, 'id', true) && id.match(idPattern)) {
    return true
  }

  logErr('Invalid thread id', id)
  return false
}

export function isValidUrl (url, lax = false) {
  var pass = false
  if (url && hasValidType(url, 'url', true)) {
    if(isValidHttpUrl(url)){
      return true
    }
    if(lax){
      pass = true
    }
  }
  logErr('Invalid url')
  return pass
}

export function isValidLinkItm (link) {
  if (
   link && hasValidType(link, 'linked.item', true) &&
      isValidUrl(link)
  ) {
    return true
  }
  logErr('Invalid linked thread')
  return false
}


export function isValidLegacyLinkItm(item){
  return isNonEmptyObj(item) && isValidUrl(item.url) && (!item.id || item.id === '/' || isValidId(item.id))
}

export function getValidSrcUrl (url, id) {
  url = getAbsoluteUrl(url)
  if (isValidUrl(url)) {
    if (id && isValidId(id)) {
      url += '#' + id
    }
    return url
  }
  return ''
}

export function validLinks (linked) {
  var vlinked = []
  if (hasValidType(linked, 'linked', false)) {
    var len = linked.length
    var limit = itmLimits('linked')[1]
    if (len > limit) {
      logErr('Too many linked threads', len + ' /' + limit)
      len = limit
    }
    for (var i = 0; i < len; i++) {
      var url = null
      if (isValidLinkItm(linked[i])) {
        var split = splitUrlAndId(linked[i])
        url = split.url
        if (split.id) {
          url += '#' + split.id
        }
      } else if(isValidLegacyLinkItm(linked[i])){
        url = linked[i].url
        if (linked[i].id && linked[i].id !== '/') {
          url += '#' + linked[i].id
        }
      }

        if(url){
        if (!vlinked.includes(url)) {
          vlinked.push(url)
        } else {
          logErr('Duplicate linked thread', url)
        }
      }
        
      }
    }
  return vlinked
}

export function uniqueId(id, previousThreadsIds){
  if (previousThreadsIds.includes(id)) {       
    logErr('Duplicate thread id', id)
    var adt = 2
    while(previousThreadsIds.includes(id+ '-'+ adt)){
      adt++
    }
   id += '-'+ adt
  }
  return id
}

export function validThreadId(id, previousThreadsIds = [], lax = false){
  if(isValidId(id)){
    return uniqueId(id, previousThreadsIds)
  }
    if(lax){
     return uniqueId(fallbacks.id, previousThreadsIds)
    }
    return null
}

export function validThreadTitle(title, lax = false){

  if(hasValidType(title,'title', true)){
    return validLenghtStr(title, 'title', true)
  } 
  if(lax){
    return fallbacks.title
  }
  return null
}

export function validThreadDescription(description){
  if(description && hasValidType(description,'description', false)){
    return validLenghtStr(description, 'description', false)
  } 
    return '' 
}

export function validThread (thread, previousThreadsIds = [], lax = false) {
  if (!hasValidType(thread, 'threads.item', true)) {
    return null
  }
  var id = validThreadId(thread.id, previousThreadsIds, lax)
  if(!id){
    return null
  }
  var title = validThreadTitle(thread.title, lax)
  if(!title){
    return null
  }
  var content = validContent(thread.content, lax)
  if(!content){
    return null
  }
  var t = {}
  t.id = id
  t.title = title
  t.description = validThreadDescription(thread.description)
  t.content = content
  t.linked = validLinks(thread.linked)
  return t
}

export function validThreads (threads, lax = false) {
  var vthreads = []

  if (hasValidType(threads, 'threads', true)) {
    var len = threads.length
    var limit = itmLimits('threads')[1]
    if (len > limit) {
      logErr('Too many threads', len + ' /' + limit)
      len = limit
    }
    var ids = []
    for (var i = 0; i < len; i++) {
      var thread = validThread(threads[i], ids, lax)

      if (thread !== null) {   
        ids.push(thread.id)
        vthreads.push(thread)
      }
    }

    if (vthreads.length) {
      return vthreads
    }
  }
  logErr('No valid thread')
  return []
}


export function validAuthorHandle(handle, lax = false){
  if(hasValidType(handle, 'handle', true)){  
    return validLenghtStr(handle, 'handle', true)
  }
  if(lax){
      return fallbacks.handle
    }    
  return null
}

export function validAuthorUrl(url, lax = false){
  if(isValidUrl(url,  lax)){
   return url
  } 
  if(lax){
    return fallbacks.url
  }
  return null
}

export function validAuthorAbout(about){
  if (about && hasValidType(about, 'about', false)) {
    return validLenghtStr(about, 'about', false)
    } 
    return ''
}

export function fallbackAuthor(lax = false){
  if(lax){
    return {
      handle:fallbacks.handle,
      about: '',
      url:fallbacks.url
    }
  } 
    return null
}

export function validAuthor (author, lax = false) {

  if (!hasValidType(author, 'author', true)) {
   return fallbackAuthor(lax)
  }
  var handle = validAuthorHandle(author.handle, lax)
  if(!handle){
    return null
  }
  var url = validAuthorUrl(author.url, lax)
  if(!url){
    return null
  }
  var a = {}
  a.handle = handle
  a.about = validAuthorAbout(author.about)
  a.url = url
return a
}

export function isValidAppUrl (url) {
  if (isValidUrl(url) && url === appUrl) {
    return true
  }
  logErr('Invalid app url')
  return false
}

export function validAppUrl (url) {
  if (!isValidAppUrl(url)) {
    url = appUrl
  }
  return url
}

export function validData (nxdata, lax = false) {
  if (hasValidType(nxdata, 'nxdata', true)) {
    var d = {}
    d.nexus = validAppUrl(nxdata.nexus)
    d.author = validAuthor(nxdata.author, lax)
    if (d.author) {
      d.threads = validThreads(nxdata.threads, lax)
      if (lax || d.threads.length) {
        return d
      }
    }
  }
  return null
}
