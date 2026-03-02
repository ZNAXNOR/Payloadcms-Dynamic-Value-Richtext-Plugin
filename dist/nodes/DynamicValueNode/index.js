import { $applyNodeReplacement, TextNode } from '@payloadcms/richtext-lexical/lexical';
import { dynamicValueIcons } from '../../icons/dynamicValue/index.js';
export const DYNAMIC_VALUE_NODE_TYPE = 'dynamic-value';
export const LEGACY_DYNAMIC_VALUE_NODE_TYPE = 'dynamicValue';
const getAppliedIconTypes = (node)=>{
    const iconTypes = [];
    const parent = node.getParent();
    if (parent?.getType() === 'link') {
        iconTypes.push('link');
    }
    if (node.hasFormat('bold')) {
        iconTypes.push('bold');
    }
    if (node.hasFormat('italic')) {
        iconTypes.push('italic');
    }
    if (node.hasFormat('underline')) {
        iconTypes.push('underline');
    }
    if (node.hasFormat('strikethrough')) {
        iconTypes.push('strikethrough');
    }
    return iconTypes;
};
const buildIconsDataURI = (iconTypes)=>{
    if (!iconTypes.length) {
        return null;
    }
    const fillColor = '#b7c4ff';
    const strokeColor = '#b7c4ff';
    const iconGap = 2;
    const iconSize = 14;
    const totalWidth = iconTypes.length * iconSize + (iconTypes.length - 1) * iconGap;
    const paths = iconTypes.map((iconType, index)=>{
        const icon = dynamicValueIcons[iconType];
        const x = index * (iconSize + iconGap);
        if (icon.mode === 'stroke') {
            return `<g transform='translate(${x} 0)'><path d='${icon.path}' fill='none' stroke='${strokeColor}' stroke-linecap='square'/></g>`;
        }
        return `<g transform='translate(${x} 0)'><path d='${icon.path}' fill='${fillColor}'/></g>`;
    }).join('');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${totalWidth}' height='14' viewBox='0 0 ${totalWidth} 20'>${paths}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};
const selectElementText = (dom)=>{
    const selection = window.getSelection();
    if (!selection) {
        return;
    }
    const range = document.createRange();
    range.selectNodeContents(dom);
    selection.removeAllRanges();
    selection.addRange(range);
};
let hasRegisteredSelectionStyle = false;
const ensureInvisibleSelectionStyle = ()=>{
    if (hasRegisteredSelectionStyle || typeof document === 'undefined') {
        return;
    }
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    .payload-dynamic-value-node::selection {
      background: transparent;
      color: inherit;
      -webkit-text-fill-color: inherit;
    }

    .payload-dynamic-value-node::-moz-selection {
      background: transparent;
      color: inherit;
      -webkit-text-fill-color: inherit;
    }
  `;
    document.head.append(styleElement);
    hasRegisteredSelectionStyle = true;
};
const applyDynamicValueStyles = (node, dom)=>{
    ensureInvisibleSelectionStyle();
    const iconTypes = getAppliedIconTypes(node);
    const iconDataURI = buildIconsDataURI(iconTypes);
    const iconBlockWidth = iconTypes.length ? iconTypes.length * 16 : 0;
    dom.classList.add('payload-dynamic-value-node');
    dom.setAttribute('data-payload-dynamic-value', 'true');
    dom.setAttribute('data-payload-dynamic-field', node.__field);
    dom.setAttribute('data-payload-dynamic-icons', iconTypes.join(','));
    dom.style.alignItems = 'center';
    dom.style.backgroundColor = 'var(--theme-elevation-150)';
    dom.style.backgroundImage = iconDataURI || 'none';
    dom.style.backgroundPosition = '6px center';
    dom.style.backgroundRepeat = 'no-repeat';
    dom.style.backgroundSize = iconTypes.length ? `${iconBlockWidth - 2}px 14px` : '0 0';
    dom.style.border = '1px solid var(--theme-elevation-300)';
    dom.style.borderRadius = '4px';
    dom.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
    dom.style.color = 'var(--theme-text)';
    dom.style.cursor = 'pointer';
    dom.style.display = 'inline-flex';
    dom.style.fontFamily = 'var(--font-mono, monospace)';
    dom.style.fontSize = '0.85em';
    dom.style.margin = '0 2px';
    dom.style.minHeight = '1.6em';
    dom.style.padding = iconTypes.length ? `1px 6px 1px ${iconBlockWidth + 12}px` : '1px 6px';
    dom.style.userSelect = 'all';
    dom.style.verticalAlign = 'middle';
    dom.style.webkitTextFillColor = 'var(--theme-text)';
    dom.onmousedown = (event)=>{
        event.preventDefault();
        selectElementText(dom);
    };
};
export class DynamicValueNode extends TextNode {
    __field;
    constructor(field, text, key){
        super(text, key);
        this.__field = field;
    }
    static clone(node) {
        return new DynamicValueNode(node.__field, node.__text, node.__key);
    }
    static getType() {
        return DYNAMIC_VALUE_NODE_TYPE;
    }
    static importDOM() {
        return {
            span: (domNode)=>{
                if (domNode instanceof HTMLSpanElement && domNode.hasAttribute('data-payload-dynamic-value')) {
                    return {
                        conversion: convertDynamicValueElement,
                        priority: 2
                    };
                }
                return null;
            }
        };
    }
    static importJSON(serializedNode) {
        const node = $createDynamicValueNode(serializedNode.field, serializedNode.label || serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setStyle(serializedNode.style);
        node.setMode(serializedNode.mode);
        node.setDetail(serializedNode.detail);
        return node;
    }
    createDOM(config) {
        const dom = super.createDOM(config);
        applyDynamicValueStyles(this, dom);
        return dom;
    }
    exportDOM() {
        const element = document.createElement('span');
        element.setAttribute('data-payload-dynamic-value', 'true');
        element.setAttribute('data-payload-dynamic-field', this.__field);
        element.textContent = this.getTextContent();
        return {
            element
        };
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            type: DYNAMIC_VALUE_NODE_TYPE,
            field: this.__field,
            label: this.getTextContent(),
            version: 1
        };
    }
    getField() {
        return this.__field;
    }
    isTextEntity() {
        return true;
    }
    updateDOM(prevNode, dom, config) {
        const didUpdate = super.updateDOM(prevNode, dom, config);
        if (prevNode.__field !== this.__field || prevNode.getFormat() !== this.getFormat()) {
            applyDynamicValueStyles(this, dom);
        }
        return didUpdate;
    }
}
function convertDynamicValueElement(domNode) {
    const span = domNode;
    const field = span.getAttribute('data-payload-dynamic-field') || span.textContent || '';
    return {
        node: $createDynamicValueNode(field, span.textContent || field)
    };
}
export function $createDynamicValueNode(field, text) {
    const node = new DynamicValueNode(field, text || field);
    node.setMode('token');
    return $applyNodeReplacement(node);
}
export function $isDynamicValueNode(node) {
    return node?.getType() === DYNAMIC_VALUE_NODE_TYPE;
}

//# sourceMappingURL=index.js.map