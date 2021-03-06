/* eslint-disable no-useless-escape */
/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
export const appUrl = 'https://nexus-dock.github.io/'
export const typesMap = {
  nxdata: 'Object',
  nexus: 'String',
  author: 'Object',
  handle: 'String',
  about: 'String',
  url: 'String',
  threads: 'Array',
  'threads.item': 'Object',
  id: 'String',
  title: 'String',
  description: 'String',
  content: 'Object',
  timestamp: 'String',
  main: 'String',
  aside: 'String',
  media: 'Object',
  type: 'String',
  caption: 'String',
  linked: 'Array',
  'linked.item': 'String'
}
export const required = ['nexus', 'author', 'threads', 'handle', 'url', 'id', 'title', 'content', 'timestamp', 'main', 'type']

export const fallbacks = {
  handle:"---",
  url:"http://...",
  id:"---",
  title:"---",
  timestamp: "0000-00-00",
  main: "...",
  type: "page"
}

export const charMinMax = {
  handle: [3, 30],
  about: [0, 400],
  title: [3, 30],
  description: [0, 400],
  main: [1, 1000],
  aside: [0, 400],
  caption: [0, 200]
}
export const itemsMinMax = {
  threads: [1, 100],
  linked: [0, 100]
}
export const supportedOembedMedia = [
  'youtube',
  'vimeo',
  'soundcloud'
]
export const supportedBaseMedia = [
  'page',
  'video',
  'image',
  'audio'
]
export const supportedMediaTypes = supportedBaseMedia.concat(supportedOembedMedia)
export const timestampPattern =
    '^[0-9]{4}((-|\s|\.|\/)(0[1-9]|1[0-2])((-|\s|\.|\/)(0[1-9]|[1-2][0-9]|3[0-1]))?)?'
export const idPattern = '^[a-zA-Z0-9-]{3,36}$'
export const urlPattern = '^https?:\/\/.*'
