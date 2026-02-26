import { DecoratorNode, type DOMConversionMap, type DOMExportOutput, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread } from '@payloadcms/richtext-lexical/lexical';
import React from 'react';
export type SerializedDynamicValueNode = Spread<{
    field: string;
    label?: string;
}, SerializedLexicalNode>;
export declare class DynamicValueNode extends DecoratorNode<React.ReactNode> {
    __field: string;
    __label: string;
    constructor(field: string, label?: string, key?: NodeKey);
    static clone(node: DynamicValueNode): DynamicValueNode;
    static getType(): string;
    static importDOM(): DOMConversionMap | null;
    static importJSON(serializedNode: SerializedDynamicValueNode): DynamicValueNode;
    createDOM(): HTMLElement;
    decorate(): React.ReactNode;
    exportDOM(): DOMExportOutput;
    exportJSON(): SerializedDynamicValueNode;
    getField(): string;
    getTextContent(): string;
    isInline(): boolean;
    isToken(): boolean;
    updateDOM(): boolean;
}
export declare function $createDynamicValueNode(field: string, label?: string): DynamicValueNode;
export declare function $isDynamicValueNode(node: LexicalNode | null | undefined): node is DynamicValueNode;
