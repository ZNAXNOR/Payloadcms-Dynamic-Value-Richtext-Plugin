import type { JSXConverters } from '@payloadcms/richtext-lexical/react'

import React from 'react'

import type { SerializedDynamicValueNode } from '../nodes/DynamicValueNode/index.js'

import {
  DYNAMIC_VALUE_NODE_TYPE,
  LEGACY_DYNAMIC_VALUE_NODE_TYPE,
} from '../nodes/DynamicValueNode/index.js'

type DynamicValueIconType = 'bold' | 'italic' | 'strikethrough' | 'underline'

type IconDefinition = {
  mode: 'fill' | 'stroke'
  path: string
}

const TEXT_FORMAT = {
  bold: 1,
  italic: 2,
  strikethrough: 4,
  underline: 8,
} as const

const iconByType: Record<DynamicValueIconType, IconDefinition> = {
  bold: {
    mode: 'fill',
    path: 'M10.6772 15H6.27017V5.718H10.4172C12.6792 5.718 13.8492 6.602 13.8492 8.292C13.8492 9.098 13.1992 9.982 12.4712 10.216C13.3812 10.476 14.1742 11.256 14.1742 12.322C14.1742 14.09 12.9002 15 10.6772 15ZM8.46717 9.501H10.3262C11.3012 9.501 11.7042 9.046 11.7042 8.409C11.7042 7.72 11.2362 7.317 10.3392 7.317H8.46717V9.501ZM8.46717 11.061V13.401H10.4822C11.4702 13.401 11.9642 12.959 11.9642 12.218C11.9642 11.49 11.4702 11.061 10.4822 11.061H8.46717Z',
  },
  italic: {
    mode: 'fill',
    path: 'M11.2353 5.718L8.8563 15H6.7113L9.0903 5.718H11.2353ZM12.4963 7.421H8.3233L8.7393 5.718H12.9123L12.4963 7.421ZM9.2203 15H5.0473L5.4633 13.297H9.6363L9.2203 15Z',
  },
  strikethrough: {
    mode: 'fill',
    path: 'M10.0247 12.049C8.38672 11.516 7.75072 11.165 7.75072 10.476C7.75072 9.91799 8.20572 9.48899 9.28472 9.48899C10.3377 9.48899 11.0697 9.89199 11.9277 10.398L13.1887 8.99499C12.4607 8.47499 11.5507 7.99399 10.4287 7.83799L10.7407 6.62999H9.15472L8.82572 7.88999C7.22672 8.17599 5.89172 9.17699 5.89172 10.788C5.89172 12.452 7.25672 13.128 8.64072 13.557C10.2727 14.062 10.9857 14.347 10.9857 15.113C10.9857 15.763 10.4547 16.127 9.41472 16.127C8.35472 16.127 7.50272 15.737 6.61872 15.074L5.33272 16.503C6.08272 17.127 7.16172 17.647 8.40672 17.828L8.06772 19.14H9.65072L9.98672 17.854C11.5987 17.568 12.8707 16.581 12.8707 14.931C12.8707 13.206 11.4017 12.504 10.0247 12.049ZM5.19531 11.698H13.5543V13.076H5.19531V11.698Z',
  },
  underline: {
    mode: 'fill',
    path: 'M13.1577 5.718V11.945C13.1577 14.168 11.7277 15.182 9.89466 15.182C8.02266 15.182 6.59266 14.168 6.59266 11.945V5.718H8.78966V11.711C8.78966 12.751 9.21866 13.245 9.88166 13.245C10.5317 13.245 10.9607 12.751 10.9607 11.711V5.718H13.1577ZM6.26758 16.157H13.4956V17.704H6.26758V16.157Z',
  },
}

const getAppliedIconTypes = (node: SerializedDynamicValueNode): DynamicValueIconType[] => {
  const format = typeof node.format === 'number' ? node.format : 0
  const icons: DynamicValueIconType[] = []

  if (format & TEXT_FORMAT.bold) {
    icons.push('bold')
  }

  if (format & TEXT_FORMAT.italic) {
    icons.push('italic')
  }

  if (format & TEXT_FORMAT.underline) {
    icons.push('underline')
  }

  if (format & TEXT_FORMAT.strikethrough) {
    icons.push('strikethrough')
  }

  return icons
}

const buildIconsDataURI = (iconTypes: DynamicValueIconType[]): null | string => {
  if (!iconTypes.length) {
    return null
  }

  const fillColor = '#b7c4ff'
  const iconGap = 2
  const iconSize = 14
  const totalWidth = iconTypes.length * iconSize + (iconTypes.length - 1) * iconGap

  const paths = iconTypes
    .map((iconType, index) => {
      const icon = iconByType[iconType]
      const x = index * (iconSize + iconGap)

      if (icon.mode === 'stroke') {
        return `<g transform='translate(${x} 0)'><path d='${icon.path}' fill='none' stroke='${fillColor}' stroke-linecap='square'/></g>`
      }

      return `<g transform='translate(${x} 0)'><path d='${icon.path}' fill='${fillColor}'/></g>`
    })
    .join('')

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${totalWidth}' height='14' viewBox='0 0 ${totalWidth} 20'>${paths}</svg>`

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const tokenStyle = (node: SerializedDynamicValueNode): React.CSSProperties => {
  const iconTypes = getAppliedIconTypes(node)
  const iconDataURI = buildIconsDataURI(iconTypes)
  const iconBlockWidth = iconTypes.length ? iconTypes.length * 16 : 0

  return {
    alignItems: 'center',
    backgroundColor: 'var(--theme-elevation-150)',
    backgroundImage: iconDataURI || 'none',
    backgroundPosition: '6px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: iconTypes.length ? `${iconBlockWidth - 2}px 14px` : '0 0',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    color: 'var(--theme-text)',
    display: 'inline-flex',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.85em',
    margin: '0 2px',
    minHeight: '1.6em',
    padding: iconTypes.length ? `1px 6px 1px ${iconBlockWidth + 12}px` : '1px 6px',
    userSelect: 'all',
    verticalAlign: 'middle',
    WebkitTextFillColor: 'var(--theme-text)',
  }
}

const renderDynamicValueLabel = (node: SerializedDynamicValueNode) => {
  return (
    <span
      data-payload-dynamic-field={node.field}
      data-payload-dynamic-icons={getAppliedIconTypes(node).join(',')}
      data-payload-dynamic-value="true"
      key={node.field}
      style={tokenStyle(node)}
    >
      {node.label}
    </span>
  )
}

const dynamicValueJSXConverter = ({ node }: { node: unknown }) => {
  const dynamicNode = node as SerializedDynamicValueNode
  return renderDynamicValueLabel(dynamicNode)
}

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
      const label =
        typeof resolvedValue === 'string'
          ? resolvedValue
          : typeof resolvedValue === 'number' || typeof resolvedValue === 'boolean'
            ? String(resolvedValue)
            : JSON.stringify(resolvedValue)

      return renderDynamicValueLabel({
        ...dynamicNode,
        label: label || dynamicNode.label,
      })
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
