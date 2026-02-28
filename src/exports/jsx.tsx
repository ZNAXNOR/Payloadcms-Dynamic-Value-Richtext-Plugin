import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

import React from 'react'

import type { SerializedDynamicValueNode } from '../nodes/DynamicValueNode/index.js'

/**
 * JSX Converters for the DynamicValueNode.
 *
 * @example Basic usage (renders the stored label):
 * ```tsx
 * import { RichText } from '@payloadcms/richtext-lexical/react'
 * import { DynamicValueJSXConverters } from '@od-labs/payloadcms-dynamic-value-richtext/jsx'
 *
 * <RichText data={content} converters={DynamicValueJSXConverters} />
 * ```
 *
 * @example With live data substitution:
 * ```tsx
 * import { RichText } from '@payloadcms/richtext-lexical/react'
 * import { createDynamicValueJSXConverters } from '@od-labs/payloadcms-dynamic-value-richtext/jsx'
 *
 * const converters = createDynamicValueJSXConverters({ data: myDocumentData })
 * <RichText data={content} converters={converters} />
 * ```
 */
export const DynamicValueJSXConverters: JSXConverters = {
  'dynamic-value': ({ node }) => {
    const n = node as SerializedDynamicValueNode
    return (
      <span data-payload-dynamic-field={n.field} data-payload-dynamic-value="true" key={n.field}>
        {n.label}
      </span>
    )
  },
}

/**
 * Creates JSX converters that resolve the node's field value from a data object
 * at render time. Useful for substituting real values in frontend rendering.
 *
 * @param options.data - A flat or nested object containing the actual values.
 *   Field paths like "companyInfo.companyName" will be resolved using dot notation.
 * @param options.fallback - Optional fallback renderer when value not found.
 *   Defaults to rendering the stored label.
 */
export function createDynamicValueJSXConverters(options: {
  data?: Record<string, unknown>
  fallback?: (node: SerializedDynamicValueNode) => React.ReactNode
}): JSXConverters {
  const { data = {}, fallback } = options

  return {
    'dynamic-value': ({ node }) => {
      const n = node as SerializedDynamicValueNode

      // Resolve dot-notation field paths (e.g. "companyInfo.companyName")
      const resolvedValue = n.field.split('.').reduce<unknown>((obj, key) => {
        if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
          return (obj as Record<string, unknown>)[key]
        }
        return undefined
      }, data)

      if (resolvedValue !== undefined && resolvedValue !== null && resolvedValue !== '') {
        return (
          <span
            data-payload-dynamic-field={n.field}
            data-payload-dynamic-value="true"
            key={n.field}
          >
            {String(resolvedValue)}
          </span>
        )
      }

      // Fallback: call custom fallback or render stored label
      if (fallback) {
        return <React.Fragment key={n.field}>{fallback(n)}</React.Fragment>
      }

      return (
        <span data-payload-dynamic-field={n.field} data-payload-dynamic-value="true" key={n.field}>
          {n.label}
        </span>
      )
    },
  }
}
