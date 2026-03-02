import type { Field } from 'payload'

import { createNode, createServerFeature } from '@payloadcms/richtext-lexical'

import {
  DYNAMIC_VALUE_NODE_TYPE,
  DynamicValueNode,
  LEGACY_DYNAMIC_VALUE_NODE_TYPE,
} from '../../nodes/DynamicValueNode/index.js'

export type DynamicValueFeatureProps = {
  collections?: string[]
  fields?: Field[]
  globals?: string[]
  trigger?: string
}

type DynamicValueOption = {
  label: string
  value: string
}

const blockedFieldTypes = new Set(['array', 'blocks', 'richText', 'ui', 'upload'])

const flattenFields = (fields: Field[], options: DynamicValueOption[], prefix = ''): void => {
  for (const field of fields) {
    const fieldName = 'name' in field ? field.name : undefined
    const hasFieldName = typeof fieldName === 'string' && fieldName.length > 0

    const nextPrefix = hasFieldName ? (prefix ? `${prefix}.${fieldName}` : fieldName) : prefix

    if (
      hasFieldName &&
      typeof field.type === 'string' &&
      !blockedFieldTypes.has(field.type) &&
      nextPrefix
    ) {
      const fieldLabel = 'label' in field && typeof field.label === 'string' ? field.label : fieldName

      options.push({
        label: fieldLabel,
        value: nextPrefix,
      })
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      flattenFields(field.fields, options, nextPrefix)
    }

    if (field.type === 'tabs' && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        if (tab.fields) {
          flattenFields(tab.fields, options, prefix)
        }
      }
    }
  }
}

const mapToEnabledSlugs = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([slug]) => slug)
}

export const DynamicValueFeature = createServerFeature<
  DynamicValueFeatureProps,
  DynamicValueFeatureProps,
  {
    options: DynamicValueOption[]
    trigger: string
  }
>({
  feature: ({ config: payloadConfig, props: featureProps }) => {
    const pluginOptions = payloadConfig.custom?.dynamicValue || {}
    const props = { ...pluginOptions, ...(featureProps || {}) }

    const options: DynamicValueOption[] = []
    const trigger = props.trigger || '@'

    if (props.fields) {
      flattenFields(props.fields, options)
    }

    if (props.collections && payloadConfig.collections) {
      const collectionSlugs = mapToEnabledSlugs(props.collections)

      for (const slug of collectionSlugs) {
        const collection = payloadConfig.collections.find((item) => item.slug === slug)

        if (collection) {
          flattenFields(collection.fields, options, slug)
        }
      }
    }

    if (props.globals && payloadConfig.globals) {
      const globalSlugs = mapToEnabledSlugs(props.globals)

      for (const slug of globalSlugs) {
        const global = payloadConfig.globals.find((item) => item.slug === slug)

        if (global) {
          flattenFields(global.fields, options, slug)
        }
      }
    }

    return {
      clientFeatureProps: {
        options,
        trigger,
      },
      key: 'dynamicValue',
      nodes: [
        createNode({
          converters: {
            html: {
              converter: ({ node }: { node: { field?: string; label?: string; value?: string } }) => {
                const field = node.field || node.value || ''
                const label = node.label || field

                return `<span data-payload-dynamic-value="true" data-payload-dynamic-field="${field}">${label}</span>`
              },
              nodeTypes: [DYNAMIC_VALUE_NODE_TYPE, LEGACY_DYNAMIC_VALUE_NODE_TYPE],
            },
          },
          node: DynamicValueNode,
        }),
      ],
      sanitizedServerFeatureProps: props,
    }
  },
  key: 'dynamicValue',
})
