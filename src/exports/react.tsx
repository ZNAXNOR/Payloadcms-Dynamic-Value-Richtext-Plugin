import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

import { RichText } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import { createDynamicValueJSXConverters } from './jsx.js'

type DynamicValueRichTextProps = {
  className?: string
  converters?: JSXConverters
  data: any
  disableContainer?: boolean
  disableIndent?: boolean | string[]
  disableTextAlign?: boolean | string[]
  payloadData?: Record<string, unknown>
}

/**
 * Drop-in RichText renderer that always includes dynamic-value converters.
 *
 * This prevents "unknown node" output for DynamicValueNode even if the
 * consuming app forgets to pass plugin converters manually.
 */
export const DynamicValueRichText: React.FC<DynamicValueRichTextProps> = ({
  converters,
  payloadData,
  ...props
}) => {
  return (
    <RichText
      {...props}
      converters={{
        ...(converters || {}),
        ...createDynamicValueJSXConverters({ data: payloadData || props.data || {} }),
      }}
    />
  )
}
