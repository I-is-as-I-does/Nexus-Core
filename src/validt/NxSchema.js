/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
import { appUrl, charMinMax, idPattern, supportedMediaTypes, timestampPattern, urlPattern } from './NxSpecs.js'

export const NxSchema = {
  $schema: 'http://json-schema.org/draft-07/schema',
  type: 'object',
  properties: {
    nexus: {
      type: 'string',
      const: appUrl
    },
    author: {
      type: 'object',
      required: ['handle', 'url'],
      properties: {
        handle: {
          type: 'string',
          maxLength: charMinMax.handle[1]
        },
        about: {
          type: 'string',
          maxLength: charMinMax.about[1]
        },
        url: {
          type: 'string',
          pattern: urlPattern
        }
      },
      additionalProperties: false
    },
    threads: {
      type: 'array',
      uniqueItems: true,
      additionalItems: true,
      items: {
        type: 'object',
        required: ['id', 'title', 'content'],
        properties: {
          id: {
            type: 'string',
            pattern: idPattern
          },
          title: {
            type: 'string',
            minLength: charMinMax.title[0],
            maxLength: charMinMax.title[1]
          },
          description: {
            type: 'string',
            maxLength: charMinMax.description[1]
          },
          content: {
            type: 'object',
            required: ['timestamp', 'main'],
            properties: {
              timestamp: {
                type: 'string',
                pattern: timestampPattern
              },
              main: {
                type: 'string',
                minLength: charMinMax.main[0],
                maxLength: charMinMax.main[1]
              },
              aside: {
                type: 'string',
                maxLength: charMinMax.aside[1]
              },
              media: {
                type: 'object',
                required: ['url', 'type'],
                properties: {
                  url: {
                    type: 'string',
                    pattern: urlPattern
                  },
                  type: {
                    type: 'string',
                    enum: supportedMediaTypes
                  },
                  caption: {
                    type: 'string',
                    maxLength: charMinMax.caption[1]
                  }
                },
                additionalProperties: false
              }
            },
            additionalProperties: false
          },
          linked: {
            type: 'array',
            uniqueItems: true,
            additionalItems: true,
            items: {
              type: 'string',
              pattern: urlPattern
            }
          }
        },
        additionalProperties: false

      }
    }
  },
  required: [
    'nexus',
    'author',
    'threads'
  ],
  additionalProperties: false
}
