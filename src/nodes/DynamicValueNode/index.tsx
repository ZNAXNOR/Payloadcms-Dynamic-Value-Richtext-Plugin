import type {
  NodeKey,
  SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'

import {
  $applyNodeReplacement,
  $getNodeByKey,
  DecoratorNode,
} from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import React from 'react'

export const DYNAMIC_VALUE_NODE_TYPE = 'dynamic-value'
export const LEGACY_DYNAMIC_VALUE_NODE_TYPE = 'dynamicValue'

type DynamicValueFormat = 'bold' | 'italic' | 'strikethrough' | 'underline'

export type SerializedDynamicValueNode = {
  field: string
  format?: DynamicValueFormat[]
  label: string
  linkURL?: null | string
} & SerializedLexicalNode

const orderedFormats: DynamicValueFormat[] = ['bold', 'italic', 'underline', 'strikethrough']


const iconBaseProps = {
  'aria-hidden': 'true',
  className: 'icon',
  fill: 'currentColor',
  focusable: 'false',
  height: '20',
  viewBox: '0 0 20 20',
  width: '20',
  xmlns: 'http://www.w3.org/2000/svg',
} as const

const BoldIcon: React.FC = () => (
  <svg {...iconBaseProps}>
    <path
      d="M10.6772 15H6.27017V5.718H10.4172C12.6792 5.718 13.8492 6.602 13.8492 8.292C13.8492 9.098 13.1992 9.982 12.4712 10.216C13.3812 10.476 14.1742 11.256 14.1742 12.322C14.1742 14.09 12.9002 15 10.6772 15ZM8.46717 9.501H10.3262C11.3012 9.501 11.7042 9.046 11.7042 8.409C11.7042 7.72 11.2362 7.317 10.3392 7.317H8.46717V9.501ZM8.46717 11.061V13.401H10.4822C11.4702 13.401 11.9642 12.959 11.9642 12.218C11.9642 11.49 11.4702 11.061 10.4822 11.061H8.46717Z"
      fill="currentColor"
    />
  </svg>
)

const ItalicIcon: React.FC = () => (
  <svg {...iconBaseProps}>
    <path d="M11.2353 5.718L8.8563 15H6.7113L9.0903 5.718H11.2353Z" fill="currentColor" />
    <path d="M12.4963 7.421H8.3233L8.7393 5.718H12.9123L12.4963 7.421Z" fill="currentColor" />
    <path d="M9.2203 15H5.0473L5.4633 13.297H9.6363L9.2203 15Z" fill="currentColor" />
  </svg>
)

const UnderlineIcon: React.FC = () => (
  <svg {...iconBaseProps}>
    <path
      d="M13.1577 5.718V11.945C13.1577 14.168 11.7277 15.182 9.89466 15.182C8.02266 15.182 6.59266 14.168 6.59266 11.945V5.718H8.78966V11.711C8.78966 12.751 9.21866 13.245 9.88166 13.245C10.5317 13.245 10.9607 12.751 10.9607 11.711V5.718H13.1577Z"
      fill="currentColor"
    />
    <path d="M6.26758 16.157H13.4956V17.704H6.26758V16.157Z" fill="currentColor" />
  </svg>
)

const StrikethroughIcon: React.FC = () => (
  <svg {...iconBaseProps}>
    <path
      d="M10.0247 12.049C8.38672 11.516 7.75072 11.165 7.75072 10.476C7.75072 9.91799 8.20572 9.48899 9.28472 9.48899C10.3377 9.48899 11.0697 9.89199 11.9277 10.398L13.1887 8.99499C12.4607 8.47499 11.5507 7.99399 10.4287 7.83799L10.7407 6.62999H9.15472L8.82572 7.88999C7.22672 8.17599 5.89172 9.17699 5.89172 10.788C5.89172 12.452 7.25672 13.128 8.64072 13.557C10.2727 14.062 10.9857 14.347 10.9857 15.113C10.9857 15.763 10.4547 16.127 9.41472 16.127C8.35472 16.127 7.50272 15.737 6.61872 15.074L5.33272 16.503C6.08272 17.127 7.16172 17.647 8.40672 17.828L8.06772 19.14H9.65072L9.98672 17.854C11.5987 17.568 12.8707 16.581 12.8707 14.931C12.8707 13.206 11.4017 12.504 10.0247 12.049Z"
      fill="currentColor"
    />
    <path d="M5.19531 11.698H13.5543V13.076H5.19531V11.698Z" fill="currentColor" />
  </svg>
)

const LinkIcon: React.FC = () => (
  <svg {...iconBaseProps} fill="none">
    <path
      className="stroke"
      d="M7.99999 13.3333H6.66666C5.78261 13.3333 4.93476 12.9821 4.30964 12.357C3.68452 11.7319 3.33333 10.884 3.33333 9.99999C3.33333 9.11593 3.68452 8.26809 4.30964 7.64297C4.93476 7.01785 5.78261 6.66666 6.66666 6.66666H7.99999M12 6.66666H13.3333C14.2174 6.66666 15.0652 7.01785 15.6904 7.64297C16.3155 8.26809 16.6667 9.11593 16.6667 9.99999C16.6667 10.884 16.3155 11.7319 15.6904 12.357C15.0652 12.9821 14.2174 13.3333 13.3333 13.3333H12M7.33333 9.99999H12.6667"
      stroke="currentColor"
      strokeLinecap="square"
    />
  </svg>
)

const getLeadingIcon = ({
  format,
  hasLink,
}: {
  format: DynamicValueFormat[]
  hasLink: boolean
}): React.FC => {
  if (hasLink) {
    return LinkIcon
  }

  if (format.includes('bold')) {
    return BoldIcon
  }

  if (format.includes('italic')) {
    return ItalicIcon
  }

  if (format.includes('underline')) {
    return UnderlineIcon
  }

  if (format.includes('strikethrough')) {
    return StrikethroughIcon
  }

  return LinkIcon
}

const formatButtons: Array<{ format: DynamicValueFormat; Icon: React.FC; label: string }> = [
  { format: 'bold', Icon: BoldIcon, label: 'Bold' },
  { format: 'italic', Icon: ItalicIcon, label: 'Italic' },
  { format: 'underline', Icon: UnderlineIcon, label: 'Underline' },
  { format: 'strikethrough', Icon: StrikethroughIcon, label: 'Strikethrough' },
]

const DynamicValueToken = ({
  format,
  label,
  linkURL,
  nodeKey,
}: {
  format: DynamicValueFormat[]
  label: string
  linkURL: null | string
  nodeKey: NodeKey
}) => {
  const [editor] = useLexicalComposerContext()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const Icon = getLeadingIcon({ format, hasLink: Boolean(linkURL) })

  const toggleFormat = (nextFormat: DynamicValueFormat) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!$isDynamicValueNode(node)) {
        return
      }

      const currentFormats = node.getFormat()
      const updatedFormats = currentFormats.includes(nextFormat)
        ? currentFormats.filter((item) => item !== nextFormat)
        : [...currentFormats, nextFormat]
      node.setFormat(updatedFormats)
    })
  }

  const toggleLink = () => {
    const nextLink = linkURL ? null : window.prompt('Enter URL', 'https://') || null

    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!$isDynamicValueNode(node)) {
        return
      }

      node.setLinkURL(nextLink)
    })
  }

  return (
    <span style={{ display: 'inline-block', position: 'relative' }}>
      <button
        contentEditable={false}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        style={{
          alignItems: 'center',
          backgroundColor: 'var(--theme-elevation-150)',
          border: '1px solid var(--theme-elevation-300)',
          borderRadius: '4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          color: 'var(--theme-text)',
          cursor: 'pointer',
          display: 'inline-flex',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.85em',
          fontWeight: 600,
          margin: '0 2px',
          padding: '1px 6px',
          userSelect: 'none',
          verticalAlign: 'middle',
        }}
        type="button"
      >
        <span style={{ color: 'var(--theme-primary)', display: 'inline-flex', marginRight: '4px' }}>
          <Icon />
        </span>
        <span
          style={{
            fontStyle: format.includes('italic') ? 'italic' : 'normal',
            fontWeight: format.includes('bold') ? 700 : 500,
            textDecoration: [
              format.includes('underline') ? 'underline' : '',
              format.includes('strikethrough') ? 'line-through' : '',
            ]
              .filter(Boolean)
              .join(' ') || 'none',
          }}
        >
          {label}
        </span>
      </button>
      {isMenuOpen ? (
        <span
          style={{
            background: 'var(--theme-bg)',
            border: '1px solid var(--theme-elevation-300)',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            gap: '4px',
            left: 0,
            padding: '4px',
            position: 'absolute',
            top: '-42px',
            zIndex: 999,
          }}
        >
          {formatButtons.map(({ format: itemFormat, Icon: ItemIcon, label: buttonLabel }) => (
            <button
              aria-label={buttonLabel}
              key={itemFormat}
              onClick={(event) => {
                event.preventDefault()
                toggleFormat(itemFormat)
              }}
              style={{
                background: format.includes(itemFormat)
                  ? 'var(--theme-elevation-200)'
                  : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                padding: '4px',
              }}
              type="button"
            >
              <ItemIcon />
            </button>
          ))}
          <button
            aria-label={linkURL ? 'Remove link' : 'Add link'}
            onClick={(event) => {
              event.preventDefault()
              toggleLink()
            }}
            style={{
              background: linkURL ? 'var(--theme-elevation-200)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              padding: '4px',
            }}
            type="button"
          >
            <LinkIcon />
          </button>
        </span>
      ) : null}
    </span>
  )
}

export class DynamicValueNode extends DecoratorNode<React.ReactNode> {
  __field: string
  __format: DynamicValueFormat[]
  __label: string
  __linkURL: null | string

  constructor(
    field: string,
    label?: string,
    format: DynamicValueFormat[] = [],
    linkURL: null | string = null,
    key?: string,
  ) {
    super(key)
    this.__field = field
    this.__format = format
    this.__label = label ?? field
    this.__linkURL = linkURL
  }

  static clone(node: DynamicValueNode): DynamicValueNode {
    return new DynamicValueNode(
      node.__field,
      node.__label,
      [...node.__format],
      node.__linkURL,
      node.getKey(),
    )
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
    return $createDynamicValueNode(
      serializedNode.field,
      serializedNode.label,
      serializedNode.format,
      serializedNode.linkURL,
    )
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'inline-block'
    span.className = 'payload-dynamic-value-node'
    return span
  }

  decorate(): React.ReactNode {
    return (
      <DynamicValueToken
        format={this.__format}
        label={this.__label}
        linkURL={this.__linkURL}
        nodeKey={this.getKey()}
      />
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
      format: this.__format,
      label: this.__label,
      linkURL: this.__linkURL,
      version: 1,
    }
  }

  getField(): string {
    return this.__field
  }

  getFormat(): DynamicValueFormat[] {
    return this.__format
  }

  getLinkURL(): null | string {
    return this.__linkURL
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

  setFormat(format: DynamicValueFormat[]): void {
    const writable = this.getWritable()
    writable.__format = orderedFormats.filter((item) => format.includes(item))
  }

  setLinkURL(linkURL: null | string): void {
    const writable = this.getWritable()
    writable.__linkURL = linkURL
  }

  updateDOM(): boolean {
    return false
  }
}

export function $createDynamicValueNode(
  field: string,
  label?: string,
  format?: DynamicValueFormat[],
  linkURL?: null | string,
): DynamicValueNode {
  return $applyNodeReplacement(new DynamicValueNode(field, label, format, linkURL))
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
