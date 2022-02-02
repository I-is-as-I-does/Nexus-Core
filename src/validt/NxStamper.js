/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import {
  isEmpty,
  seemsLikeValidDate
} from '@i-is-as-i-does/jack-js/src/modules/Check'
import {
  charCut
} from '@i-is-as-i-does/jack-js/src/modules/Help'
import {
  isValidHttpUrl
} from '@i-is-as-i-does/jack-js/src/modules/Web'

import {
  charMinMax,
  itemsMinMax,
  appUrl,
  supportedMediaTypes,
  timestampPattern,
  idPattern,
  typesMap
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
  return null
}

export function validLenghtStr (str, catg, nonEmpty = true) {
  if (!hasValidType(str, catg, nonEmpty)) {
    str = ''
  }
  if (!strHasValidMinLength(str, catg)) {
    str = extendString(str, catg)
  } else if (!strHasValidMaxLength(str, catg)) {
    str = cutString(str, catg)
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

export function validMedia (mediaObj) {
  if (
    hasValidType(mediaObj, 'media', true) &&
      isValidUrl(mediaObj.url) &&
      isValidMediaType(mediaObj.type)
  ) {
    var m = {}
    m.url = mediaObj.url
    m.type = mediaObj.type
    m.caption = ''
    if (mediaObj.caption) {
      m.caption = validLenghtStr(mediaObj.caption, 'caption', false)
    }
    return m
  }
  return { url: '', type: '', caption: '' }
}

export function isValidTimestamp (timestamp, strict = false) {
  if (
    hasValidType(timestamp, 'timestamp', true) &&
      (timestamp.match(timestampPattern) ||
        (!strict && seemsLikeValidDate(timestamp)))
  ) {
    return true
  }
  logErr('Invalid timestamp', timestamp)
  return false
}

export function validContent (content) {
  if (
    hasValidType(content, 'content', true) &&
      isValidTimestamp(content.timestamp) &&
      hasValidType(content.main, 'main', true)
  ) {
    var main = validLenghtStr(content.main, 'main')

    if (main) {
      var c = {}
      c.timestamp = content.timestamp
      c.main = main
      c.aside = ''
      if (content.aside) {
        c.aside = validLenghtStr(content.aside, 'aside', false)
      }
      c.media = validMedia(content.media)
      return c
    }
  }

  return null
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

export function isValidUrl (url) {
  if (isValidHttpUrl(url)) {
    return true
  }
  logErr('Invalid url', url)
  return false
}

export function isValidLinkItm (link) {
  if (
    hasValidType(link, 'linked.item', true) &&
      isValidUrl(link)
  ) {
    return true
  }
  logErr('Invalid linked thread')
  return false
}

export function getValidSrcUrl (url, id) {
  url = getAbsoluteUrl(url)
  if (isValidLinkItm(url)) {
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
      if (isValidLinkItm(linked[i])) {
        var split = splitUrlAndId(linked[i])
        var url = split.url
        if (split.id) {
          url += '#' + split.id
        }

        if (!vlinked.includes(url)) {
          vlinked.push(url)
          continue
        }
        logErr('Duplicate linked thread', linked[i])
      }
    }
  }
  return vlinked
}

export function validThread (thread) {
  if (
    hasValidType(thread, 'threads.item', true) &&
      isValidId(thread.id)
  ) {
    var content = validContent(thread.content)
    if (content != null) {
      var t = {}
      t.id = thread.id
      t.title = validLenghtStr(thread.title, 'title')
      t.description = ''
      if (thread.description) {
        t.description = validLenghtStr(
          thread.description,
          'description', false
        )
      }

      t.content = content
      t.linked = validLinks(thread.linked)
      return t
    }
  }
  return null
}

export function validThreads (threads) {
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
      var thread = validThread(threads[i])

      if (thread !== null) {
        if (!ids.includes(thread.id)) {
          ids.push(thread.id)
          vthreads.push(thread)
          continue
        }
        logErr('Duplicate thread id', thread.id)
      }
    }

    if (vthreads.length) {
      return vthreads
    }
  }
  logErr('No valid thread')
  return []
}

export function validAuthor (author) {
  if (
    hasValidType(author, 'author', true) &&
      isValidUrl(author.url)
  ) {
    var handle = validLenghtStr(author.handle, 'handle')
    if (handle) {
      var a = {}
      a.handle = handle
      a.about = ''
      if (author.about) {
        a.about = validLenghtStr(author.about, 'about', false)
      }
      a.url = author.url
      return a
    }
  }
  return null
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

export function validData (nxdata) {
  if (hasValidType(nxdata, 'nxdata', true)) {
    var d = {}
    d.nexus = validAppUrl(nxdata.nexus)
    d.author = validAuthor(nxdata.author)
    if (d.author) {
      d.threads = validThreads(nxdata.threads)
      if (d.threads.length) {
        return d
      }
    }
  }
  return null
}
