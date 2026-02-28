import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedTextNode, Spread } from '@payloadcms/richtext-lexical/lexical';
import { TextNode } from '@payloadcms/richtext-lexical/lexical';
export declare const DYNAMIC_VALUE_NODE_TYPE = "dynamic-value";
export declare const LEGACY_DYNAMIC_VALUE_NODE_TYPE = "dynamicValue";
export type SerializedDynamicValueNode = Spread<{
    field: string;
    label?: string;
    type: typeof DYNAMIC_VALUE_NODE_TYPE;
    version: 1;
}, SerializedTextNode>;
export declare class DynamicValueNode extends TextNode {
    __field: string;
    constructor(field: string, text: string, key?: NodeKey);
    static clone(node: DynamicValueNode): DynamicValueNode;
    static getType(): string;
    static importDOM(): DOMConversionMap | null;
    static importJSON(serializedNode: SerializedDynamicValueNode): DynamicValueNode;
    createDOM(config: EditorConfig): HTMLElement;
    exportDOM(): DOMExportOutput;
    exportJSON(): SerializedDynamicValueNode;
    getField(): string;
    isTextEntity(): true;
    updateDOM(prevNode: DynamicValueNode, dom: HTMLElement, config: EditorConfig): boolean;
}
export declare function $createDynamicValueNode(field: string, text?: string): DynamicValueNode;
export declare function $isDynamicValueNode(node: LexicalNode | null | undefined): node is DynamicValueNode;
