/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { splitCurrentUrl } from '../base/NxHost'
import { splitUrlAndId } from '../validt/NxStamper'

export function threadView (thread, url) {
  return {
    src: url + '#' + thread.id,
    data: thread,
    nested: [],
    resolved: { nested: false, media: false }
  }
}

export function authorView (nxdata, url) {
  return {
    src: url,
    data: nxdata.author
  }
}

export function selectedThreadsViews (nxdata, url, ids) {
  var viewstore = {
    views: { threads: [] },
    list: [],
    failed: ids,
    confirmed: []
  }
  nxdata.threads.forEach((thread) => {
    var idx = ids.indexOf(thread.id) 
    if (idx !== -1) {
      var view = threadView(thread, url)
      viewstore.views.threads.push(view)
      viewstore.list.push(view.src)
      viewstore.confirmed.push(thread.id)
      viewstore.failed.splice(idx,1)
    }
  })
  return viewstore
}

export function allThreadsViews (nxdata, url) {
  var viewstore = {
    views: { threads: [] },
    list: []
  }
  nxdata.threads.forEach(thread => {
    var view = threadView(thread, url)
    viewstore.views.threads.push(view)
    viewstore.list.push(view.src)
  })
  return viewstore
}

export function addAuthorView (nxdata, url, viewstore) {
  viewstore.views.author = authorView(nxdata, url)
}

export function authorAndThreadsViews (nxdata, url) {
  var viewstore = allThreadsViews(nxdata, url)
  addAuthorView(nxdata, url, viewstore)
  return viewstore
}

export function authorAndselectedThreadsViews (nxdata, url, ids) {
  var viewstore = selectedThreadsViews(nxdata, url, ids)
  addAuthorView(nxdata, url, viewstore)
  return viewstore
}

export function getView (viewstore, src) {
  if (src === viewstore.views.author.src) {
    return viewstore.views.author
  }
  var index = viewstore.list.indexOf(src)
  if (index !== -1) {
    return viewstore.views.threads[index]
  }
  return null
}

export function addViewToHistory (src, replace = false) {
  var url = splitCurrentUrl.url
  var id = splitUrlAndId(src).id
  if (id) {
    url += '#' + id
  }
  if (replace) {
    window.history.replaceState({ nexus: src }, document.title, url)
  } else {
    window.history.pushState({ nexus: src }, document.title, url)
  }
}

export function listenToHistoryChange (callback) {
  window.onpopstate = function (event) {
    if (event.state && event.state.nexus) {
      callback(event.state.nexus)
    }
  }
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

export function extendInitData (seed, forceId = null) {
    seed.viewstore = authorAndThreadsViews(seed.nxdata, seed.request.url)
    seed.firstview = processFirstView(seed.request, seed.viewstore, forceId)
    addViewToHistory(seed.firstview.src, true)
    return seed
}
