import type { CollectionSlug, Field, GlobalSlug } from 'payload'

import { createNode, createServerFeature } from '@payloadcms/richtext-lexical'

import type { DynamicValueConfig, DynamicValueOption } from './types.js'

import { DynamicValueNode } from '../../nodes/DynamicValueNode/index.js'

export const DynamicValueFeature = createServerFeature<
  DynamicValueConfig,
  object,
  { options: DynamicValueOption[]; trigger: string }
>({
  feature: ({ config: payloadConfig, props }) => {
    const options: DynamicValueOption[] = []
    const trigger = props?.trigger || '@'

    const flattenFields = (fields: Field[], prefix = '') => {
      fields.forEach((field) => {
        if ('name' in field && field.name && field.type !== 'array' && field.type !== 'blocks') {
          const name = prefix ? `${prefix}.${field.name}` : field.name
          options.push({
            label: (field.label as string) || field.name,
            value: name,
          })
        }

        if ('fields' in field && field.fields && Array.isArray(field.fields)) {
          flattenFields(
            field.fields,
            'name' in field && field.name
              ? prefix
                ? `${prefix}.${field.name}`
                : field.name
              : prefix,
          )
        }

        if (field.type === 'tabs' && field.tabs) {
          field.tabs.forEach((tab) => {
            flattenFields(tab.fields, prefix)
          })
        }
      })
    }

    // 1. Process directly provided fields
    if (props?.fields) {
      flattenFields(props.fields)
    }

    // 2. Process collections
    if (props?.collections && payloadConfig.collections) {
      props.collections.forEach((slug: CollectionSlug) => {
        const collection = payloadConfig.collections?.find((c) => c.slug === slug)
        if (collection) {
          flattenFields(collection.fields, slug)
        }
      })
    }

    // 3. Process globals
    if (props?.globals && payloadConfig.globals) {
      props.globals.forEach((slug: GlobalSlug) => {
        const global = payloadConfig.globals?.find((g) => g.slug === slug)
        if (global) {
          flattenFields(global.fields, slug)
        }
      })
    }

    return {
      ClientFeature: 'payloadcms-dynamic-value-richtext/client#DynamicValueFeatureClient',
      clientProps: {
        options,
        trigger,
      },
      key: 'dynamicValue',
      nodes: [
        createNode({
          node: DynamicValueNode,
        }),
      ],
    }
  },
  key: 'dynamicValue',
})
