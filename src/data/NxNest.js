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

export function resolveLinkedViews (view, exclude = []) {
  var store = getLinkedInstances(view, exclude)
  var register = store.register
  var confirmedInstances = {}
  const promises = []
  for(let [url, ids] of Object.entries(store.instances)){
    var promise = getSrcData(url).then(nxdata => {
      var viewstore = authorAndselectedThreadsViews(nxdata, url, ids)
      if (!register && viewstore.failed.length) {
        register = true
        logErr('Linked threads could not be resolved', viewstore.failed.join(', '))
      }
      view.nested.push({views : viewstore.views, list: viewstore.list})
      confirmedInstances[url] = viewstore.confirmed
    }).catch(() => {
      if (!register){
        register = true
      }
      logErr('Linked source could not be resolved', url)
    })
    promises.push(promise)
  }

  return Promise.all(promises).then(() => { 
    if (register) {
      registerLinkedMaps(view.src, confirmedInstances)
    }
    view.resolved.nested = true
    return view
  })
}
