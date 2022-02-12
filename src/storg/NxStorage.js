/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import {
  clearPartialStorage,
  getLocalStorage,
  getSessionStorage,
  jsonSize,
} from '@i-is-as-i-does/jack-js/src/modules/Stock'

var instStores = {
  visit: {},
  data: {},
  linked: {},
  oembed: {},
}

var brwsrStores = {
  local: getLocalStorage(),
  session: getSessionStorage(),
}

Object.values(brwsrStores).forEach((store) => {
  if (store && !store.getItem('available')) {
    store.setItem('available', 5000)
  }
})

export function getBrowserStore(storage) {
  if (storage === 'local') {
    return brwsrStores.local
  }
  return brwsrStores.session
}

export function getInstStore(instanceStore){
  if(instStoreExists(instanceStore)){
    return instStores[instanceStore]
  }
  return null
}

export function instStoreExists(instanceStore) {
  return instanceStore && Object.prototype.hasOwnProperty.call(instStores, instanceStore)
}

export function instStoreHasKey(instanceStore, key) {
  return (
    instStoreExists(instanceStore) &&
    Object.prototype.hasOwnProperty.call(instStores[instanceStore], key)
  )
}

export function storeItem(key, data, storage = 'session', instanceStore = null) {
  var sdata = JSON.stringify(data)
  if (instStoreExists(instanceStore)) {
    instStores[instanceStore][key] = sdata
  }
  var store = getBrowserStore(storage)
  if (store) {
    var datasize = jsonSize(sdata, true, true)
    if (datasize > 2000) {
      return
    }

    var avail = store.getItem('available')
    if (avail < 1000) {
      avail = 5000 - clearPartialStorage(store, 2000)
    }
    avail -= datasize
    store.setItem(key, sdata)
    store.setItem('available', Math.ceil(avail))
  }
}

export function getStoredItem(key, storage = 'session', instanceStore = null) {
  if (instStoreHasKey(instanceStore, key)) {
    return JSON.parse(instStores[instanceStore][key])
  }
  var store = getBrowserStore(storage)
  if (store) {
    var sdata = store.getItem(key)
    if (sdata) {
      if (instStoreExists(instanceStore)) {
        instStores[instanceStore][key] = sdata
      }
      return JSON.parse(sdata)
    }
  }
  return null
}

export function removeItem(key, storage = 'session', instanceStore = null) {
  if (instStoreHasKey(instanceStore, key)) {
    delete instStores[instanceStore][key]
  }
  var store = getBrowserStore(storage)
  if (store) {
    store.removeItem(key)
  }
}

export function clearInstanceStores(excludeStores = []) {
  Object.keys(instStores).forEach((instanceStore) => {
    if (!excludeStores.includes(instanceStore)) {
      instStores[instanceStore] = {}
    }
  })
}

export function clearBrowserStores(excludeStore = null) {
  Object.keys(brwsrStores).forEach((name) => {
    if (brwsrStores[name] && excludeStore !== name) {
      brwsrStores[name].clear()
    }
  })
}
