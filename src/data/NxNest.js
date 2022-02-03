/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */

import { getStoredLinkedMaps, registerLinkedMaps } from '../storg/NxMemory.js'
import { splitUrlAndId } from '../validt/NxStamper.js'
import { getSrcData } from '../load/NxSrc.js'
import { logErr } from '../logs/NxLog.js'
import { authorAndselectedThreadsViews } from './NxViews.js'

export function buildLinkedInstances (view, exclude = []) {
  // @doc instances = {url:[...ids] }
  var instances = {}

  for(var i=0; i < view.data.linked.length; i++){
    if (!exclude.includes(view.data.linked[i])) {
      var split = splitUrlAndId(view.data.linked[i])
      if (!exclude.includes(split.url)) { 
        if(Object.prototype.hasOwnProperty.call(instances, split.url)){
          instances[split.url].push(split.id)
        } else {
          instances[split.url] = [split.id]
        }
      }
    }
  }
  return instances
}


export function getLinkedInstances (view, exclude = []) {
  var store = { instances: getStoredLinkedMaps(view.src), register: false }
  if (store.instances === null) {
    store.instances = buildLinkedInstances(view, exclude)
    store.register = true
  }
  return store
}

export function resolveInstanceViews (url, ids) {
  var result = { register: false, views: [], confirmed: null}
 return getSrcData(url).then(nxdata => {
    var viewstore = authorAndselectedThreadsViews(nxdata, url, ids)
    if (viewstore.failed.length) {
      result.register = true
      logErr('Linked threads could not be resolved', viewstore.failed.join(', '))
    }
    result.views = viewstore.views
    result.confirmed = viewstore.confirmed
    return result
  }).catch(() => {
    result.register = true
    logErr('Linked source could not be resolved', url)
    return result
  })
}


export function resolveLinkedViews (view, exclude = []) {
  var store = getLinkedInstances(view, exclude)
  var register = store.register
  var confirmedInstances = {}
  const promises = []
  for(let [url, ids] of Object.entries(store.instances)){
    promises.push(resolveInstanceViews(url, ids).then(result => {
      if(result.confirmed !== null){
        confirmedInstances[url] = result.confirmed
      }
      if(!register && result.register){
        register = true
      }
      view.nested.push({views : result.views})
    }))
  }

  return Promise.all(promises).then(() => {
    view.resolved.nested = true
    if (register) {
      registerLinkedMaps(view.src, confirmedInstances)
    }
  })
}
