/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { getTxt, setUserSelectedLang } from './NxCoreTranslate.js'
import { vSplitFlap } from '@i-is-as-i-does/valva/src/modules/transitions.js'

var translStore = {}

export function updateTextElm (elm, textkey) {
  vSplitFlap(elm, getTxt(textkey), 50)
}

export function triggerTranslate (lang) {
  if (setUserSelectedLang(lang)) {
    for (const [textkey, elms] of Object.entries(translStore)) {
      elms.forEach((elm) => {
        updateTextElm(elm, textkey)
      })
    }
  }
}

export function registerTranslElm (elm, textkey) {
  if (!translStore[textkey]) {
    translStore[textkey] = []
  }
  translStore[textkey].push(elm)
}
