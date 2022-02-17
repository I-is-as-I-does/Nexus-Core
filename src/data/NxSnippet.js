/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { defaultIO } from '../base/NxDefaults.js'

export function getSnippet (src, style = null, scriptSrc = null, lang = null) {
  // @doc does NOT validate arguments;
  var datalang = ''
  if (lang) {
    datalang = ' data-lang="' + lang + '"'
  }
  var datastyle = ''
  if (style) {
    datastyle = ' data-style="' + style + '"'
  }
  if (!scriptSrc) {
    scriptSrc = defaultIO
  }
  return `<div id="Nexus" data-src="${src}"${datastyle}${datalang}></div>
<script src="${scriptSrc}"></script>`
}
