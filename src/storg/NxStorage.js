/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import {
  clearPartialStorage,
  getLocalStorage,
  getSessionStorage,
  jsonSize
} from '@i-is-as-i-does/jack-js/src/modules/Stock'

const locStorag = getLocalStorage()
const sesStorag = getSessionStorage()

function setStorageAvailability (store) {
  if (store && !store.getItem('available')) {
    store.setItem('available', 5000)
  }
}

function resolveStore (storage) {
  if (storage === 'session') {
    return sesStorag
  }
  return locStorag
}

setStorageAvailability(locStorag)
setStorageAvailability(sesStorag)

export function storeItem (key, data, storage = 'session', instanceStore = null) {
  var sdata = JSON.stringify(data)
  if (instanceStore) {
    instanceStore[key] = sdata
  }
  var store = resolveStore(storage)
  if (store != null) {
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

export function getStoredItem (key, storage = 'session', instanceStore = null) {
  if (instanceStore !== null && Object.prototype.hasOwnProperty.call(instanceStore, key)) {
    return JSON.parse(instanceStore[key])
  }
  var store = resolveStore(storage)
  if (store) {
    var sdata = store.getItem(key)
    if (sdata) {
      if (instanceStore) {
        instanceStore[key] = sdata
      }
      return JSON.parse(sdata)
    }
  }
  return null
}

export function removeItem (key, storage = 'session', instanceStore = null) {
  if (instanceStore & Object.prototype.hasOwnProperty.call(instanceStore, key)) {
    delete instanceStore[key]
  }
  var store = resolveStore(storage)
  if (store) {
    store.removeItem(key)
  }
}
export function clearCache () {
  [sesStorag, locStorag].forEach(store => {
    if (store) {
      store.clear()
    }
  })
}
