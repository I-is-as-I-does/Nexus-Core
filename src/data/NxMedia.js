/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { conciseUrl, oembedLink, oembedResponse } from '@i-is-as-i-does/jack-js/src/modules/Web.js'
import { waitForElmInDOM } from '@i-is-as-i-does/jack-js/src/modules/Help.js'
import { logErr } from '../logs/NxLog.js'

import { registerOembedResponse, getStoredOembedResponse } from '../storg/NxMemory.js'
import { supportedOembedMedia } from '../validt/NxSpecs.js'

const mediaReadyEvent = new Event('mediaReady')

export function dispatchMediaReady (resolvedElm, parentElm) {
  waitForElmInDOM(resolvedElm.tagName, parentElm).then(() => {
    parentElm.dispatchEvent(mediaReadyEvent)
  })
}

export function placeMedia (url, parentElm, mediaElm) {
  if (mediaElm.tagName !== 'A') {
    var loadEvent = 'load'
    var srcElm = mediaElm
    if (['VIDEO', 'AUDIO'].includes(mediaElm.tagName)) {
      loadEvent = 'loadedmetadata'
      if (mediaElm.tagName === 'VIDEO ') {
        srcElm = mediaElm.firstChild
      }
    }
    mediaElm.addEventListener(loadEvent, function () {
      dispatchMediaReady(mediaElm, parentElm)
    })
    srcElm.addEventListener('error', function () {
      logErr('Unable to load requested media', url)
      var fallback = pageElm(url)
      mediaElm.replaceWith(fallback)
      dispatchMediaReady(fallback, parentElm)
    })
    srcElm.src = url
  } else {
    if(!mediaElm.textContent){
      mediaElm.textContent = conciseUrl(url, true)
    }
    dispatchMediaReady(mediaElm, parentElm)
    mediaElm.href = url
  }
  parentElm.append(mediaElm)
}

export function setMediaUrl (srcElm, attrb = 'src', url = null) {
  if (url) {
    srcElm.setAttribute(attrb, url)
  }
}

export function pageElm (url = null) {
  var mediaElm = document.createElement('A')
  mediaElm.target = '_blank'
  if(url){
    mediaElm.textContent = conciseUrl(url, true)
    mediaElm.setAttribute('href', url)
  }
  return mediaElm
}

export function videoElm (url = null) {
  var mediaElm = document.createElement('VIDEO')
  mediaElm.setAttribute('controls', true)
  var srcElm = document.createElement('SOURCE')
  mediaElm.append(srcElm)
  setMediaUrl(srcElm, 'src', url)
  return mediaElm
}

export function audioElm (url = null) {
  var mediaElm = document.createElement('AUDIO')
  mediaElm.setAttribute('controls', true)
  setMediaUrl(mediaElm, 'src', url)
  return mediaElm
}

export function imgElm (url = null) {
  var mediaElm = document.createElement('IMG')
  setMediaUrl(mediaElm, 'src', url)
  return mediaElm
}

export function iframeElm (url = null) {
  var mediaElm = document.createElement('IFRAME')
  mediaElm.scrolling = 'no'
  mediaElm.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  mediaElm.allowfullscreen = true
  setMediaUrl(mediaElm, 'src', url)
  return mediaElm
}

export function mediaElm (type, url = null) {
  if (supportedOembedMedia.includes(type)) {
    type = 'iframe'
  }
  var f
  switch (type) {
    case 'image':
      f = imgElm
      break
    case 'video':
      f = videoElm
      break
    case 'audio':
      f = audioElm
      break
    case 'iframe':
      f = iframeElm
      break
    default:
      f = pageElm
  }
  return f(url)
}

export function resolveEmbedMediaData (url, type) {
  var iframeUrl = getStoredOembedResponse(url)
  var success = function () {
    return { type: type, url: iframeUrl }
  }
  var fallback = function () {
    return { type: 'page', url: url }
  }
  if (iframeUrl) {
    return Promise.resolve(success())
  }
  var link = oembedLink(url, type, 720)
  if (!link) {
    return Promise.resolve(fallback())
  }
  return oembedResponse(link).then(response => {
    iframeUrl = response.html.split('src="')[1].split('"')[0]
    registerOembedResponse(url, iframeUrl)
    return success()
  }).catch((err) => {
    logErr('Failed to resolved oembed media', { url: url, err: err.message })
    return fallback()
  })
}

export function resolveEmbedMedia (url, type, parentElm) {
  resolveEmbedMediaData(url, type).then(result => {
    placeMedia(result.url, parentElm, mediaElm(result.type))
  })
}

export function resolveMedia (url, type, parentElm) {
  if (supportedOembedMedia.includes(type)) {
    resolveEmbedMedia(url, type, parentElm)
  } else {
    placeMedia(url, parentElm, mediaElm(type))
  }
}

export function preResolveViewMedia (view) {
  if(view.data.content.media.type === 'page'){
    view.resolved.media = true
    return Promise.resolve(view)
  }
  var host = document.createElement('DIV')
  host.style.display = 'none'
  document.body.append(host)
  var handleResult = function () {
    if (host.firstChild.tagName === 'A' && view.data.content.media.type !== 'page') {
      view.data.content.media.type = 'page'
    } else if (host.firstChild.tagName === 'IFRAME') {
      view.data.content.media.url = host.firstChild.src
    }
    host.remove()
    view.resolved.media = true
    return view
  }
  var promise = new Promise(function (resolve) {
    host.addEventListener('mediaReady', resolve)
  }).then(handleResult)
  resolveMedia(view.data.content.media.url, view.data.content.media.type, host)
  return promise
}
