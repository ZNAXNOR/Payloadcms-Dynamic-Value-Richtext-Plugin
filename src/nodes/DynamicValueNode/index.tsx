import {
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

export type SerializedDynamicValueNode = Spread<
  {
    field: string
    label?: string
  },
  SerializedLexicalNode
>

export class DynamicValueNode extends DecoratorNode<React.ReactNode> {
  __field: string
  __label: string

  constructor(field: string, label?: string, key?: NodeKey) {
    super(key)
    this.__field = field
    this.__label = label ?? field
  }

  static clone(node: DynamicValueNode): DynamicValueNode {
    return new DynamicValueNode(node.__field, node.__label, node.getKey())
  }

  static getType(): string {
    return 'dynamic-value'
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-payload-dynamic-value')) {
          return null
        }
        return {
          conversion: (domNode: HTMLElement): DOMConversionOutput => {
            const field = domNode.getAttribute('data-payload-dynamic-field')
            const label = domNode.textContent || undefined
            if (field) {
              return { node: $createDynamicValueNode(field, label) }
            }
            return { node: null }
          },
          priority: 1,
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

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-payload-dynamic-value', 'true')
    element.setAttribute('data-payload-dynamic-field', this.__field)
    element.textContent = this.__label
    return { element }
  }

  exportJSON(): SerializedDynamicValueNode {
    return {
      type: 'dynamic-value',
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
  return new DynamicValueNode(field, label)
}

export function $isDynamicValueNode(
  node: LexicalNode | null | undefined,
): node is DynamicValueNode {
  return node?.getType() === 'dynamic-value'
}
