import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { $applyNodeReplacement, DecoratorNode } from '@payloadcms/richtext-lexical/lexical';
import React from 'react';
export class DynamicValueNode extends DecoratorNode {
    __field;
    __label;
    constructor(field, label, key){
        super(key);
        this.__field = field;
        this.__label = label ?? field;
    }
    static clone(node) {
        return new DynamicValueNode(node.__field, node.__label, node.getKey());
    }
    static getType() {
        return 'dynamic-value';
    }
    static importDOM() {
        return {
            span: (domNode)=>{
                if (!domNode.hasAttribute('data-payload-dynamic-value')) {
                    return null;
                }
                return {
                    conversion: (domNode)=>{
                        const field = domNode.getAttribute('data-payload-dynamic-field');
                        const label = domNode.textContent || undefined;
                        if (field) {
                            return {
                                node: $createDynamicValueNode(field, label)
                            };
                        }
                        return {
                            node: null
                        };
                    },
                    priority: 1
                };
            }
        };
    }
    static importJSON(serializedNode) {
        return $createDynamicValueNode(serializedNode.field, serializedNode.label);
    }
    createDOM() {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.className = 'payload-dynamic-value-node';
        return span;
    }
    decorate() {
        console.log('[DynamicValueNode] Decorating:', this.__field);
        return /*#__PURE__*/ _jsxs("span", {
            contentEditable: false,
            style: {
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
                verticalAlign: 'middle'
            },
            children: [
                /*#__PURE__*/ _jsx("span", {
                    style: {
                        color: 'var(--theme-primary)',
                        fontSize: '0.8em',
                        marginRight: '4px',
                        opacity: 0.4
                    },
                    children: "VAR"
                }),
                this.__label
            ]
        });
    }
    exportDOM() {
        const element = document.createElement('span');
        element.setAttribute('data-payload-dynamic-value', 'true');
        element.setAttribute('data-payload-dynamic-field', this.__field);
        element.textContent = this.__label;
        return {
            element
        };
    }
    exportJSON() {
        return {
            type: 'dynamic-value',
            field: this.__field,
            label: this.__label,
            version: 1
        };
    }
    getField() {
        return this.__field;
    }
    getTextContent() {
        return this.__label;
    }
    isInline() {
        return true;
    }
    isToken() {
        return true;
    }
    updateDOM() {
        return false;
    }
}
export function $createDynamicValueNode(field, label) {
    return $applyNodeReplacement(new DynamicValueNode(field, label));
}
export function $isDynamicValueNode(node) {
    return node?.getType?.() === 'dynamic-value';
}

//# sourceMappingURL=index.js.map