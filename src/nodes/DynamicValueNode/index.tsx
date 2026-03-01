import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'

import { $applyNodeReplacement, TextNode } from '@payloadcms/richtext-lexical/lexical'

export const DYNAMIC_VALUE_NODE_TYPE = 'dynamic-value'
export const LEGACY_DYNAMIC_VALUE_NODE_TYPE = 'dynamicValue'

type DynamicValueIconType = 'bold' | 'default' | 'italic' | 'link' | 'strikethrough' | 'underline'

export type SerializedDynamicValueNode = Spread<
  {
    field: string
    label?: string
    type: typeof DYNAMIC_VALUE_NODE_TYPE
    version: 1
  },
  SerializedTextNode
>

const iconSVGByType: Record<DynamicValueIconType, string> = {
  bold: `<svg aria-hidden="true" class="icon" fill="none" focusable="false" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8h9Z"/></svg>`,
  default: `<svg aria-hidden="true" class="icon" fill="none" focusable="false" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21s-4-3-4-9 4-9 4-9"/><path d="M16 3s4 3 4 9-4 9-4 9"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`,
  italic: `<svg aria-hidden="true" class="icon" fill="none" focusable="false" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>`,
  link: `<svg aria-hidden="true" class="icon" fill="none" focusable="false" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  strikethrough: `<svg aria-hidden="true" class="icon" fill="none" focusable="false" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>`,
  underline: `<svg aria-hidden="true" class="icon" fill="none" focusable="false" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>`,
}

const getIconsForNode = (node: DynamicValueNode): DynamicValueIconType[] => {
  const icons: DynamicValueIconType[] = []
  const parent = node.getParent()
  if (parent?.getType() === 'link') {
    icons.push('link')
  }

  if (node.hasFormat('bold')) {
    icons.push('bold')
  }

  if (node.hasFormat('italic')) {
    icons.push('italic')
  }

  if (node.hasFormat('underline')) {
    icons.push('underline')
  }

  if (node.hasFormat('strikethrough')) {
    icons.push('strikethrough')
  }

  if (icons.length === 0) {
    icons.push('default')
  }

  return icons
}

const updateDOMAttributes = (node: DynamicValueNode, dom: HTMLElement): void => {
  dom.classList.add('payload-dynamic-value-node')
  dom.setAttribute('data-payload-dynamic-value', 'true')
  dom.setAttribute('data-payload-dynamic-field', node.__field)
  dom.setAttribute('data-payload-dynamic-icons', getIconsForNode(node).join(','))
  dom.setAttribute('contenteditable', 'false')
  dom.style.alignItems = 'center'
  dom.style.backgroundColor = 'var(--theme-elevation-100)'
  dom.style.border = '1px solid var(--theme-elevation-250)'
  dom.style.borderRadius = '6px'
  dom.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
  dom.style.cursor = 'pointer'
  dom.style.display = 'inline-flex'
  dom.style.fontFamily = 'inherit'
  dom.style.fontSize = '0.95em'
  dom.style.fontWeight = node.hasFormat('bold') ? 'bold' : 'normal'
  dom.style.fontStyle = node.hasFormat('italic') ? 'italic' : 'normal'
  dom.style.margin = '0 1px'
  dom.style.padding = '2px 8px'
  dom.style.textDecoration = [
    node.hasFormat('underline') ? 'underline' : '',
    node.hasFormat('strikethrough') ? 'line-through' : '',
  ]
    .filter(Boolean)
    .join(' ')
  dom.style.transition = 'all 0.1s ease'
  dom.style.userSelect = 'all'
  dom.style.verticalAlign = 'baseline'

  let iconContainer = dom.querySelector<HTMLSpanElement>('.payload-dynamic-value-node__icons')
  if (!iconContainer) {
    iconContainer = document.createElement('span')
    iconContainer.className = 'payload-dynamic-value-node__icons'
    iconContainer.setAttribute('contenteditable', 'false')
    iconContainer.style.alignItems = 'center'
    iconContainer.style.color = 'var(--theme-elevation-600)'
    iconContainer.style.display = 'inline-flex'
    iconContainer.style.gap = '2px'
    iconContainer.style.marginRight = '6px'
    iconContainer.style.pointerEvents = 'none'
    dom.prepend(iconContainer)
  }

  iconContainer.innerHTML = getIconsForNode(node)
    .map((iconType) => iconSVGByType[iconType])
    .join('')
}

export class DynamicValueNode extends TextNode {
  __field: string

  constructor(field: string, text: string, key?: NodeKey) {
    super(text, key)
    this.__field = field
  }

  static clone(node: DynamicValueNode): DynamicValueNode {
    return new DynamicValueNode(node.__field, node.__text, node.__key)
  }

  static getType(): string {
    return DYNAMIC_VALUE_NODE_TYPE
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: Node) => {
        if (
          domNode instanceof HTMLSpanElement &&
          domNode.hasAttribute('data-payload-dynamic-value')
        ) {
          return {
            conversion: convertDynamicValueElement,
            priority: 2,
          }
        }

        return null
      },
    }
  }

  static importJSON(serializedNode: SerializedDynamicValueNode): DynamicValueNode {
    const node = $createDynamicValueNode(
      serializedNode.field,
      serializedNode.label || serializedNode.text,
    )
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    updateDOMAttributes(this, dom)
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-payload-dynamic-value', 'true')
    element.setAttribute('data-payload-dynamic-field', this.__field)
    element.setAttribute('data-payload-dynamic-format', String(this.getFormat()))
    element.textContent = this.getTextContent()

    // Apply inline styles for non-CSS environments
    if (this.hasFormat('bold')) {
      element.style.fontWeight = 'bold'
    }
    if (this.hasFormat('italic')) {
      element.style.fontStyle = 'italic'
    }
    const decoration = [
      this.hasFormat('underline') ? 'underline' : '',
      this.hasFormat('strikethrough') ? 'line-through' : '',
    ]
      .filter(Boolean)
      .join(' ')
    if (decoration) {
      element.style.textDecoration = decoration
    }

    return {
      element,
    }
  }

  exportJSON(): SerializedDynamicValueNode {
    return {
      ...super.exportJSON(),
      type: DYNAMIC_VALUE_NODE_TYPE,
      field: this.__field,
      label: this.getTextContent(),
      version: 1,
    }
  }

  getField(): string {
    return this.__field
  }

  isTextEntity(): true {
    return true
  }

  updateDOM(prevNode: DynamicValueNode, dom: HTMLElement, config: EditorConfig): boolean {
    const isUpdated = (
      super.updateDOM as (
        prevNode: DynamicValueNode,
        dom: HTMLElement,
        config: EditorConfig,
      ) => boolean
    )(prevNode, dom, config)

    if (
      prevNode.__field !== this.__field ||
      prevNode.getFormat() !== this.getFormat() ||
      prevNode.getParent() !== this.getParent()
    ) {
      updateDOMAttributes(this, dom)
    }

    return isUpdated
  }
}

function convertDynamicValueElement(domNode: Node): DOMConversionOutput {
  const span = domNode as HTMLSpanElement
  const field = span.getAttribute('data-payload-dynamic-field') || span.textContent || ''

  const node = $createDynamicValueNode(field, span.textContent || field)

  return {
    node,
  }
}

export function $createDynamicValueNode(field: string, text?: string): DynamicValueNode {
  const node = new DynamicValueNode(field, text || field)
  node.setMode('token')
  return $applyNodeReplacement(node)
}

export function $isDynamicValueNode(
  node: LexicalNode | null | undefined,
): node is DynamicValueNode {
  return node?.getType() === DYNAMIC_VALUE_NODE_TYPE
}
