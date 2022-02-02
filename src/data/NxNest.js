/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */

import { getStoredLinkedMaps, registerLinkedMaps } from '../storg/NxMemory.js'
import { splitUrlAndId } from '../validt/NxStamper.js'
import { getSrcData } from '../load/NxSrc.js'
import { logErr } from '../logs/NxLog.js'
import { authorAndselectedThreadsViews } from './NxViews.js'

export function buildLinkedInstances (thread, exclude = []) {
  // @doc instances = [{url:'', ids:[]}, ...]
  var instances = []
  var list = []
  thread.linked.forEach(url => {
    if (!exclude.includes(url)) {
      var split = splitUrlAndId(url)
      if (!exclude.includes(split.url)) {
        var idx = list.indexOf(split.url)
        var id = split.id
        if (idx !== -1) {
          // @doc: stamper already removed duplicates
          instances[idx].ids.push(id)
        } else {
          instances.push({
            url: split.url,
            ids: [id]
          })
          list.push(split.url)
        }
      }
    }
  })
  return instances
}

export function getLinkedInstances (view, exclude = []) {
  var instances = getStoredLinkedMaps(view.src)
  var register = false
  if (instances === null) {
    instances = buildLinkedInstances(view.data, exclude)
    register = true
  }
  return { instances: instances, register: register }
}

export function resolveInstanceViews (instance) {
  var result = { views: { threads: [], author: null }, register: false }
  return getSrcData(instance.url).then(nxdata => {
    var viewstore = authorAndselectedThreadsViews(nxdata, instance.url, instance.ids)
    if (viewstore.failed.length) {
      result.register = true
      instance.ids = viewstore.confirmed
      logErr('Linked threads could not be resolved', viewstore.failed.join(', '))
    }
    result.views = viewstore.views
    return result
  }).catch(() => {
    result.register = true
    logErr('Linked source could not be resolved', instance.url)
    return result
  })
}

export function resolveLinkedViews (view, exclude = []) {
  var store = getLinkedInstances(view, exclude)
  var promises = []

  store.instances.forEach((instance) => {
    var prom = resolveInstanceViews(instance).then(result => {
      if (result.register) {
        store.register = true
      }
      view.nested.push({ views: result.views })
    })
    promises.push(prom)
  })
  return Promise.all(promises).then(() => {
    view.resolved.nested = true

    if (store.register) {
      registerLinkedMaps(view.src, store.instances)
    }
  })
}
