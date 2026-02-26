'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createClientFeature } from '@payloadcms/richtext-lexical/client';
import { $insertNodes } from '@payloadcms/richtext-lexical/lexical';
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalTypeaheadMenuPlugin';
import { AtSign, Hash, Variable } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { $createDynamicValueNode, DynamicValueNode } from '../../nodes/DynamicValueNode/index.js';
function useTriggerMatch(trigger) {
    return useCallback((text)=>{
        const triggerIndex = text.lastIndexOf(trigger);
        if (triggerIndex === -1) {
            return null;
        }
        const charBeforeTrigger = triggerIndex > 0 ? text[triggerIndex - 1] : null;
        if (charBeforeTrigger && !/[\s(]/.test(charBeforeTrigger)) {
            return null;
        }
        const matchingString = text.slice(triggerIndex + 1);
        if (/\s/.test(matchingString)) {
            return null;
        }
        return {
            leadOffset: triggerIndex,
            matchingString,
            replaceableString: trigger + matchingString
        };
    }, [
        trigger
    ]);
}
const DynamicValuePlugin = ({ anchorElem, options: allOptions, trigger })=>{
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState(null);
    const checkForTriggerMatch = useTriggerMatch(trigger);
    const options = useMemo(()=>{
        const searchString = queryString?.toLowerCase() || '';
        return (allOptions || []).filter((option)=>option.label.toLowerCase().includes(searchString) || option.value.toLowerCase().includes(searchString)).map((opt)=>({
                ...opt,
                key: opt.value
            }));
    }, [
        queryString,
        allOptions
    ]);
    const TypeaheadMenu = LexicalTypeaheadMenuPlugin;
    const IconToUse = trigger === '@' ? AtSign : trigger === '#' ? Hash : Variable;
    return /*#__PURE__*/ _jsx(TypeaheadMenu, {
        anchorElem: anchorElem || (typeof document !== 'undefined' ? document.body : undefined),
        menuRenderFn: (anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex })=>{
            const anchor = anchorElementRef?.current || anchorElem || (typeof document !== 'undefined' ? document.body : null);
            if (!anchor || !options.length) {
                return null;
            }
            return /*#__PURE__*/ ReactDOM.createPortal(/*#__PURE__*/ _jsxs("div", {
                className: "dynamic-value-popup",
                style: {
                    background: 'var(--theme-elevation-100)',
                    border: '1px solid var(--theme-elevation-250)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    minWidth: '260px',
                    overflow: 'hidden',
                    padding: '4px',
                    zIndex: 100000
                },
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        style: {
                            borderBottom: '1px solid var(--theme-elevation-150)',
                            color: 'var(--theme-text)',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            marginBottom: '4px',
                            opacity: 0.6,
                            padding: '10px 14px 6px',
                            textTransform: 'uppercase'
                        },
                        children: "Merge Fields"
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        style: {
                            maxHeight: '300px',
                            overflowY: 'auto'
                        },
                        children: options.map((option, index)=>{
                            const isSelected = selectedIndex === index;
                            return /*#__PURE__*/ _jsxs("button", {
                                onClick: ()=>selectOptionAndCleanUp(option),
                                onMouseEnter: ()=>setHighlightedIndex(index),
                                style: {
                                    alignItems: 'center',
                                    background: isSelected ? 'var(--theme-primary)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: isSelected ? 'white' : 'var(--theme-text)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    textAlign: 'left',
                                    transition: 'all 0.15s ease',
                                    width: '100%'
                                },
                                type: "button",
                                children: [
                                    /*#__PURE__*/ _jsx(IconToUse, {
                                        size: 14,
                                        style: {
                                            opacity: isSelected ? 1 : 0.4
                                        }
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column'
                                        },
                                        children: [
                                            /*#__PURE__*/ _jsx("span", {
                                                style: {
                                                    fontSize: '13px',
                                                    fontWeight: 500
                                                },
                                                children: option.label
                                            }),
                                            /*#__PURE__*/ _jsx("span", {
                                                style: {
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '11px',
                                                    opacity: 0.5
                                                },
                                                children: option.value
                                            })
                                        ]
                                    })
                                ]
                            }, option.value);
                        })
                    })
                ]
            }), anchor);
        },
        onQueryChange: setQueryString,
        onSelectOption: (option, textNodeToReplace, closeMenu)=>{
            editor.update(()=>{
                if (textNodeToReplace) {
                    textNodeToReplace.remove();
                }
                const node = $createDynamicValueNode(option.value, option.label);
                $insertNodes([
                    node
                ]);
                closeMenu();
            });
        },
        options: options,
        triggerFn: checkForTriggerMatch
    });
};
export const DynamicValueFeatureClient = createClientFeature(({ props })=>{
    const options = props?.options || [];
    const trigger = props?.trigger || '@';
    const IconToUse = trigger === '@' ? AtSign : trigger === '#' ? Hash : Variable;
    return {
        nodes: [
            DynamicValueNode
        ],
        plugins: [
            {
                Component: (pluginProps)=>/*#__PURE__*/ _jsx(DynamicValuePlugin, {
                        ...pluginProps,
                        options: options,
                        trigger: trigger
                    }),
                position: 'floatingAnchorElem'
            }
        ],
        sanitizedClientFeatureProps: props,
        toolbarFixed: {
            groups: [
                {
                    type: 'dropdown',
                    ChildComponent: ()=>/*#__PURE__*/ _jsx("div", {
                            style: {
                                alignItems: 'center',
                                display: 'flex',
                                gap: '4px'
                            },
                            children: /*#__PURE__*/ _jsx(IconToUse, {
                                size: 14,
                                style: {
                                    color: 'var(--theme-text)',
                                    opacity: 0.7
                                }
                            })
                        }),
                    items: options.map((field)=>({
                            key: field.value,
                            label: field.label,
                            onSelect: ({ editor })=>{
                                editor.update(()=>{
                                    const node = $createDynamicValueNode(field.value, field.label);
                                    $insertNodes([
                                        node
                                    ]);
                                });
                            }
                        })),
                    key: 'dynamicValue',
                    order: 99
                }
            ]
        }
    };
});

//# sourceMappingURL=feature.client.js.map