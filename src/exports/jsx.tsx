import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

import React from 'react'

import type { SerializedDynamicValueNode } from '../nodes/DynamicValueNode/index.js'

import {
  DYNAMIC_VALUE_NODE_TYPE,
  LEGACY_DYNAMIC_VALUE_NODE_TYPE,
} from '../nodes/DynamicValueNode/index.js'

const renderDynamicValueLabel = (node: SerializedDynamicValueNode) => {
  return (
    <span
      data-payload-dynamic-field={node.field}
      data-payload-dynamic-value="true"
      key={node.field}
    >
      {node.label}
    </span>
  )
}

const dynamicValueJSXConverter = ({ node }: { node: unknown }) => {
  const dynamicNode = node as SerializedDynamicValueNode
  return renderDynamicValueLabel(dynamicNode)
}

/**
 * JSX converters for dynamic value nodes. Includes both the current node type and
 * the legacy type to keep older content working.
 */
export const DynamicValueJSXConverters: JSXConverters = {
  [DYNAMIC_VALUE_NODE_TYPE]: dynamicValueJSXConverter,
  [LEGACY_DYNAMIC_VALUE_NODE_TYPE]: dynamicValueJSXConverter,
}

export const withDynamicValueJSXConverters = (converters?: JSXConverters): JSXConverters => ({
  ...(converters || {}),
  ...DynamicValueJSXConverters,
})

export function createDynamicValueJSXConverters(options: {
  data?: Record<string, unknown>
  fallback?: (node: SerializedDynamicValueNode) => React.ReactNode
}): JSXConverters {
  const { data = {}, fallback } = options

  const converter = ({ node }: { node: unknown }) => {
    const dynamicNode = node as SerializedDynamicValueNode
    const resolvedValue = dynamicNode.field.split('.').reduce<unknown>((current, key) => {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key]
      }

      return undefined
    }, data)

    if (resolvedValue !== undefined && resolvedValue !== null && resolvedValue !== '') {
      return (
        <span
          data-payload-dynamic-field={dynamicNode.field}
          data-payload-dynamic-value="true"
          key={dynamicNode.field}
        >
          {String(resolvedValue)}
        </span>
      )
    }

    if (fallback) {
      return <React.Fragment key={dynamicNode.field}>{fallback(dynamicNode)}</React.Fragment>
    }

    return renderDynamicValueLabel(dynamicNode)
  }

  return {
    [DYNAMIC_VALUE_NODE_TYPE]: converter,
    [LEGACY_DYNAMIC_VALUE_NODE_TYPE]: converter,
  }
}
