import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical';
import { DecoratorNode } from '@payloadcms/richtext-lexical/lexical';
import React from 'react';
export declare const DYNAMIC_VALUE_NODE_TYPE = "dynamic-value";
export declare const LEGACY_DYNAMIC_VALUE_NODE_TYPE = "dynamicValue";
export type SerializedDynamicValueNode = {
    field: string;
    label: string;
} & SerializedLexicalNode;
export declare class DynamicValueNode extends DecoratorNode<React.ReactNode> {
    __field: string;
    __label: string;
    constructor(field: string, label?: string, key?: string);
    static clone(node: DynamicValueNode): DynamicValueNode;
    static getType(): string;
    static importDOM(): {
        span: (domNode: HTMLSpanElement) => {
            conversion: (el: HTMLSpanElement) => {
                node: DynamicValueNode | null;
            };
            priority: 1;
        } | null;
    };
    static importJSON(serializedNode: SerializedDynamicValueNode): DynamicValueNode;
    createDOM(): HTMLElement;
    decorate(): React.ReactNode;
    exportDOM(): {
        element: HTMLSpanElement;
    };
    exportJSON(): SerializedDynamicValueNode;
    getField(): string;
    getTextContent(): string;
    isInline(): boolean;
    isToken(): boolean;
    updateDOM(): boolean;
}
export declare function $createDynamicValueNode(field: string, label?: string): DynamicValueNode;
export declare function $isDynamicValueNode(node: unknown): node is DynamicValueNode;
