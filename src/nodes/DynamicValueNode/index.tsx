import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical'

import { $applyNodeReplacement, DecoratorNode } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

export const DYNAMIC_VALUE_NODE_TYPE = 'dynamic-value'
export const LEGACY_DYNAMIC_VALUE_NODE_TYPE = 'dynamicValue'

export type SerializedDynamicValueNode = {
  field: string
  label: string
} & SerializedLexicalNode

export class DynamicValueNode extends DecoratorNode<React.ReactNode> {
  __field: string
  __label: string

  constructor(field: string, label?: string, key?: string) {
    super(key)
    this.__field = field
    this.__label = label ?? field
  }

  static clone(node: DynamicValueNode): DynamicValueNode {
    return new DynamicValueNode(node.__field, node.__label, node.getKey())
  }

  static getType(): string {
    return DYNAMIC_VALUE_NODE_TYPE
  }

  static importDOM() {
    return {
      span: (domNode: HTMLSpanElement) => {
        if (!domNode.hasAttribute('data-payload-dynamic-value')) {
          return null
        }

        return {
          conversion: (el: HTMLSpanElement) => {
            const field = el.getAttribute('data-payload-dynamic-field')
            const label = el.textContent || undefined

            return {
              node: field ? $createDynamicValueNode(field, label) : null,
            }
          },
          priority: 1 as const,
        }
      },
    }
  }

  static importJSON(serializedNode: SerializedDynamicValueNode): DynamicValueNode {
    return $createDynamicValueNode(serializedNode.field, serializedNode.label)
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'inline-block'
    span.className = 'payload-dynamic-value-node'
    return span
  }

  decorate(): React.ReactNode {
    return (
      <span
        contentEditable={false}
        style={{
          alignItems: 'center',
          backgroundColor: 'var(--theme-elevation-150)',
          border: '1px solid var(--theme-elevation-300)',
          borderRadius: '4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          color: 'var(--theme-text)',
          cursor: 'default',
          display: 'inline-flex',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.85em',
          fontWeight: 600,
          margin: '0 2px',
          padding: '1px 6px',
          userSelect: 'none',
          verticalAlign: 'middle',
        }}
      >
        <span
          style={{
            color: 'var(--theme-primary)',
            fontSize: '0.8em',
            marginRight: '4px',
            opacity: 0.4,
          }}
        >
          VAR
        </span>
        {this.__label}
      </span>
    )
  }

  exportDOM() {
    const element = document.createElement('span')
    element.setAttribute('data-payload-dynamic-value', 'true')
    element.setAttribute('data-payload-dynamic-field', this.__field)
    element.textContent = this.__label

    return {
      element,
    }
  }

  exportJSON(): SerializedDynamicValueNode {
    return {
      type: DYNAMIC_VALUE_NODE_TYPE,
      field: this.__field,
      label: this.__label,
      version: 1,
    }
  }

  getField(): string {
    return this.__field
  }

  getTextContent(): string {
    return this.__label
  }

  isInline(): boolean {
    return true
  }

  isToken(): boolean {
    return true
  }

  updateDOM(): boolean {
    return false
  }
}

export function $createDynamicValueNode(field: string, label?: string): DynamicValueNode {
  return $applyNodeReplacement(new DynamicValueNode(field, label))
}

export function $isDynamicValueNode(node: unknown): node is DynamicValueNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'getType' in node &&
    typeof (node as { getType: () => string }).getType === 'function' &&
    (node as { getType: () => string }).getType() === DYNAMIC_VALUE_NODE_TYPE
  )
}
