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

type DynamicValueIconType = 'bold' | 'italic' | 'link' | 'strikethrough' | 'underline'

type IconDefinition = {
  mode: 'fill' | 'stroke'
  path: string
}

export type SerializedDynamicValueNode = Spread<
  {
    field: string
    label?: string
    type: typeof DYNAMIC_VALUE_NODE_TYPE
    version: 1
  },
  SerializedTextNode
>

const iconByType: Record<DynamicValueIconType, IconDefinition> = {
  bold: {
    mode: 'fill',
    path: 'M10.6772 15H6.27017V5.718H10.4172C12.6792 5.718 13.8492 6.602 13.8492 8.292C13.8492 9.098 13.1992 9.982 12.4712 10.216C13.3812 10.476 14.1742 11.256 14.1742 12.322C14.1742 14.09 12.9002 15 10.6772 15ZM8.46717 9.501H10.3262C11.3012 9.501 11.7042 9.046 11.7042 8.409C11.7042 7.72 11.2362 7.317 10.3392 7.317H8.46717V9.501ZM8.46717 11.061V13.401H10.4822C11.4702 13.401 11.9642 12.959 11.9642 12.218C11.9642 11.49 11.4702 11.061 10.4822 11.061H8.46717Z',
  },
  italic: {
    mode: 'fill',
    path: 'M11.2353 5.718L8.8563 15H6.7113L9.0903 5.718H11.2353ZM12.4963 7.421H8.3233L8.7393 5.718H12.9123L12.4963 7.421ZM9.2203 15H5.0473L5.4633 13.297H9.6363L9.2203 15Z',
  },
  link: {
    mode: 'stroke',
    path: 'M7.99999 13.3333H6.66666C5.78261 13.3333 4.93476 12.9821 4.30964 12.357C3.68452 11.7319 3.33333 10.884 3.33333 9.99999C3.33333 9.11593 3.68452 8.26809 4.30964 7.64297C4.93476 7.01785 5.78261 6.66666 6.66666 6.66666H7.99999M12 6.66666H13.3333C14.2174 6.66666 15.0652 7.01785 15.6904 7.64297C16.3155 8.26809 16.6667 9.11593 16.6667 9.99999C16.6667 10.884 16.3155 11.7319 15.6904 12.357C15.0652 12.9821 14.2174 13.3333 13.3333 13.3333H12M7.33333 9.99999H12.6667',
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

const getAppliedIconTypes = (node: DynamicValueNode): DynamicValueIconType[] => {
  const iconTypes: DynamicValueIconType[] = []
  const parent = node.getParent()

  if (parent?.getType() === 'link') {
    iconTypes.push('link')
  }

  if (node.hasFormat('bold')) {
    iconTypes.push('bold')
  }

  if (node.hasFormat('italic')) {
    iconTypes.push('italic')
  }

  if (node.hasFormat('underline')) {
    iconTypes.push('underline')
  }

  if (node.hasFormat('strikethrough')) {
    iconTypes.push('strikethrough')
  }

  return iconTypes
}

const buildIconsDataURI = (iconTypes: DynamicValueIconType[]): null | string => {
  if (!iconTypes.length) {
    return null
  }

  const fillColor = '#b7c4ff'
  const strokeColor = '#b7c4ff'
  const iconGap = 2
  const iconSize = 14
  const totalWidth = iconTypes.length * iconSize + (iconTypes.length - 1) * iconGap

  const paths = iconTypes
    .map((iconType, index) => {
      const icon = iconByType[iconType]
      const x = index * (iconSize + iconGap)

      if (icon.mode === 'stroke') {
        return `<g transform='translate(${x} 0)'><path d='${icon.path}' fill='none' stroke='${strokeColor}' stroke-linecap='square'/></g>`
      }

      return `<g transform='translate(${x} 0)'><path d='${icon.path}' fill='${fillColor}'/></g>`
    })
    .join('')

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${totalWidth}' height='14' viewBox='0 0 ${totalWidth} 20'>${paths}</svg>`

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const selectElementText = (dom: HTMLElement): void => {
  const selection = window.getSelection()
  if (!selection) {
    return
  }

  const range = document.createRange()
  range.selectNodeContents(dom)
  selection.removeAllRanges()
  selection.addRange(range)
}

const applyDynamicValueStyles = (node: DynamicValueNode, dom: HTMLElement): void => {
  const iconTypes = getAppliedIconTypes(node)
  const iconDataURI = buildIconsDataURI(iconTypes)
  const iconBlockWidth = iconTypes.length ? iconTypes.length * 16 : 0

  dom.classList.add('payload-dynamic-value-node')
  dom.setAttribute('data-payload-dynamic-value', 'true')
  dom.setAttribute('data-payload-dynamic-field', node.__field)
  dom.setAttribute('data-payload-dynamic-icons', iconTypes.join(','))

  dom.style.alignItems = 'center'
  dom.style.backgroundColor = 'var(--theme-elevation-150)'
  dom.style.backgroundImage = iconDataURI || 'none'
  dom.style.backgroundPosition = '6px center'
  dom.style.backgroundRepeat = 'no-repeat'
  dom.style.backgroundSize = iconTypes.length ? `${iconBlockWidth - 2}px 14px` : '0 0'
  dom.style.border = '1px solid var(--theme-elevation-300)'
  dom.style.borderRadius = '4px'
  dom.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
  dom.style.color = 'var(--theme-text)'
  dom.style.cursor = 'pointer'
  dom.style.display = 'inline-flex'
  dom.style.fontFamily = 'var(--font-mono, monospace)'
  dom.style.fontSize = '0.85em'
  dom.style.margin = '0 2px'
  dom.style.minHeight = '1.6em'
  dom.style.padding = iconTypes.length ? `1px 6px 1px ${iconBlockWidth + 12}px` : '1px 6px'
  dom.style.userSelect = 'all'
  dom.style.verticalAlign = 'middle'
  dom.style.webkitTextFillColor = 'var(--theme-text)'

  dom.onmousedown = (event) => {
    event.preventDefault()
    selectElementText(dom)
  }
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
    node.setStyle(serializedNode.style)
    node.setMode(serializedNode.mode)
    node.setDetail(serializedNode.detail)

    return node
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    applyDynamicValueStyles(this, dom)
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-payload-dynamic-value', 'true')
    element.setAttribute('data-payload-dynamic-field', this.__field)
    element.textContent = this.getTextContent()

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
    const didUpdate = (super.updateDOM as (
      node: DynamicValueNode,
      element: HTMLElement,
      editorConfig: EditorConfig,
    ) => boolean)(prevNode, dom, config)

    if (prevNode.__field !== this.__field || prevNode.getFormat() !== this.getFormat()) {
      applyDynamicValueStyles(this, dom)
    }

    return didUpdate
  }
}

function convertDynamicValueElement(domNode: Node): DOMConversionOutput {
  const span = domNode as HTMLSpanElement
  const field = span.getAttribute('data-payload-dynamic-field') || span.textContent || ''

  return {
    node: $createDynamicValueNode(field, span.textContent || field),
  }
}

export function $createDynamicValueNode(field: string, text?: string): DynamicValueNode {
  const node = new DynamicValueNode(field, text || field)
  node.setMode('token')
  return $applyNodeReplacement(node)
}

export function $isDynamicValueNode(node: LexicalNode | null | undefined): node is DynamicValueNode {
  return node?.getType() === DYNAMIC_VALUE_NODE_TYPE
}
