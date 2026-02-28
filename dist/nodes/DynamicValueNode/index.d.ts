import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical';
import { DecoratorNode } from '@payloadcms/richtext-lexical/lexical';
import React from 'react';
export declare const DYNAMIC_VALUE_NODE_TYPE = "dynamic-value";
export declare const LEGACY_DYNAMIC_VALUE_NODE_TYPE = "dynamicValue";
type DynamicValueFormat = 'bold' | 'italic' | 'strikethrough' | 'underline';
export type SerializedDynamicValueNode = {
    field: string;
    format?: DynamicValueFormat[];
    label: string;
    linkURL?: null | string;
} & SerializedLexicalNode;
export declare class DynamicValueNode extends DecoratorNode<React.ReactNode> {
    __field: string;
    __format: DynamicValueFormat[];
    __label: string;
    __linkURL: null | string;
    constructor(field: string, label?: string, format?: DynamicValueFormat[], linkURL?: null | string, key?: string);
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
    getFormat(): DynamicValueFormat[];
    getLinkURL(): null | string;
    getTextContent(): string;
    isInline(): boolean;
    isToken(): boolean;
    setFormat(format: DynamicValueFormat[]): void;
    setLinkURL(linkURL: null | string): void;
    updateDOM(): boolean;
}
export declare function $createDynamicValueNode(field: string, label?: string, format?: DynamicValueFormat[], linkURL?: null | string): DynamicValueNode;
export declare function $isDynamicValueNode(node: unknown): node is DynamicValueNode;
export {};
