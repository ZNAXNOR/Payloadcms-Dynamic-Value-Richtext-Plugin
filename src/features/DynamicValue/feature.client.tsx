'use client'

console.log('[DynamicValueFeature] feature.client.tsx loaded')

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import {
  $createTextNode,
  $insertNodes,
  type LexicalNode,
} from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { LexicalTypeaheadMenuPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalTypeaheadMenuPlugin'
import { useForm } from '@payloadcms/ui'
import { AtSign, Hash, Variable } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import * as ReactDOM from 'react-dom'

import { $createDynamicValueNode, DynamicValueNode } from '../../nodes/DynamicValueNode/index.js'

export function $isDynamicValueNode(
  node: LexicalNode | null | undefined,
): node is DynamicValueNode {
  return node?.getType?.() === 'dynamic-value'
}

function useTriggerMatch(trigger: string) {
  return useCallback(
    (text: string) => {
      const triggerIndex = text.lastIndexOf(trigger)
      if (triggerIndex === -1) {
        return null
      }

      const charBeforeTrigger = triggerIndex > 0 ? text[triggerIndex - 1] : null
      if (charBeforeTrigger && !/[\s(]/.test(charBeforeTrigger)) {
        return null
      }

      const matchingString = text.slice(triggerIndex + 1)
      if (/\s/.test(matchingString)) {
        return null
      }

      return {
        leadOffset: triggerIndex,
        matchingString,
        replaceableString: trigger + matchingString,
      }
    },
    [trigger],
  )
}

const SelectIcon = (trigger: string) => {
  const IconToUse = trigger === '@' ? AtSign : trigger === '#' ? Hash : Variable
  return () => (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: '20px',
        justifyContent: 'center',
        width: '20px',
      }}
    >
      <IconToUse className="icon" size={16} style={{ color: 'currentColor' }} />
    </div>
  )
}

const DynamicValuePlugin = ({
  anchorElem,
  options: allOptions,
  trigger,
}: {
  anchorElem?: HTMLElement
  options: any[]
  trigger: string
}) => {
  const [editor] = useLexicalComposerContext()
  const { fields } = useForm()
  const [queryString, setQueryString] = useState<null | string>(null)
  const checkForTriggerMatch = useTriggerMatch(trigger)

  const options = useMemo(() => {
    const searchString = queryString?.toLowerCase() || ''
    return (allOptions || [])
      .filter((option) => {
        const val = fields[option.value]?.value
        const hasValue = val !== undefined && val !== null && val !== ''
        return (
          hasValue &&
          (option.label.toLowerCase().includes(searchString) ||
            option.value.toLowerCase().includes(searchString))
        )
      })
      .map((opt) => ({
        ...opt,
        key: opt.value,
      }))
  }, [queryString, allOptions, fields])

  const IconToUse = trigger === '@' ? AtSign : trigger === '#' ? Hash : Variable

  return (
    <LexicalTypeaheadMenuPlugin
      {...({
        anchorElem: anchorElem || (typeof document !== 'undefined' ? document.body : undefined),
      } as any)}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        const anchor =
          anchorElementRef?.current ||
          anchorElem ||
          (typeof document !== 'undefined' ? document.body : null)
        if (!anchor || !options.length) {
          return null
        }

        return ReactDOM.createPortal(
          <div
            className="dynamic-value-popup"
            style={{
              background: 'var(--theme-elevation-100)',
              border: '1px solid var(--theme-elevation-250)',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              minWidth: '260px',
              overflow: 'hidden',
              padding: '4px',
              zIndex: 100000,
            }}
          >
            <div
              style={{
                borderBottom: '1px solid var(--theme-elevation-150)',
                color: 'var(--theme-text)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                marginBottom: '4px',
                opacity: 0.6,
                padding: '10px 14px 6px',
                textTransform: 'uppercase',
              }}
            >
              Merge Fields
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {options.map((option, index) => {
                const isSelected = selectedIndex === index
                return (
                  <button
                    key={option.value}
                    onClick={() => selectOptionAndCleanUp(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
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
                      width: '100%',
                    }}
                    type="button"
                  >
                    <IconToUse size={14} style={{ opacity: isSelected ? 1 : 0.4 }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{option.label}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          opacity: 0.5,
                        }}
                      >
                        {option.value}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>,
          anchor,
        )
      }}
      onQueryChange={setQueryString}
      onSelectOption={(option: any, textNodeToReplace, closeMenu) => {
        editor.update(() => {
          if (textNodeToReplace) {
            textNodeToReplace.remove()
          }
          const node = $createDynamicValueNode(option.value, option.label)
          $insertNodes([node, $createTextNode(' ')])
          closeMenu()
        })
      }}
      options={options as any}
      triggerFn={checkForTriggerMatch as any}
    />
  )
}

const DropdownItemComponent = ({ editor, field, item, trigger }: any) => {
  const { fields } = useForm()
  const val = fields[field.value]?.value
  const hasValue = val !== undefined && val !== null && val !== ''

  if (!hasValue) {
    return null
  }

  const IconToUse = trigger === '@' ? AtSign : trigger === '#' ? Hash : Variable

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        item.onSelect({ editor, isActive: false })
      }}
      style={{
        alignItems: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: 'var(--theme-text)',
        cursor: 'pointer',
        display: 'flex',
        gap: '10px',
        padding: '8px 12px',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        width: '100%',
      }}
      type="button"
    >
      <IconToUse size={14} style={{ opacity: 0.4 }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, lineHeight: '1.2' }}>{field.label}</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: '1.2',
            opacity: 0.5,
          }}
        >
          {field.value}
        </span>
      </div>
    </button>
  )
}

export const DynamicValueFeatureClient = createClientFeature((args: any) => {
  console.log('[DynamicValueFeature] Initializing Client Feature', {
    args,
    nodesFound: Boolean(DynamicValueNode),
  })
  const props = args?.clientFeatureProps || args?.props || {}
  const options = props?.options || []
  const trigger = props?.trigger || '@'

  const groupItems = options.map((field: any) => ({
    Component: ({ editor, item }: any) => (
      <DropdownItemComponent editor={editor} field={field} item={item} trigger={trigger} />
    ),
    isActive: () => false,
    isEnabled: () => true,
    key: `dv-item-${field.value}`,
    label: field.label,
    onSelect: ({ editor }: any) => {
      console.log('[DynamicValueFeature] Toolbar Select:', field.value)
      editor.update(() => {
        try {
          const node = $createDynamicValueNode(field.value, field.label)
          $insertNodes([node, $createTextNode(' ')])
        } catch (e) {
          console.error('[DynamicValueFeature] Insertion failed:', e)
        }
      })
    },
    order: 1,
  }))

  const toolbarGroup = {
    type: 'dropdown' as const,
    ChildComponent: SelectIcon(trigger),
    items: groupItems,
    key: 'dynamic-value-toolbar-group', // Unique key to avoid Link feature collision
    order: 10,
  }

  return {
    nodes: [DynamicValueNode],
    plugins: [
      {
        Component: (pluginProps) => (
          <DynamicValuePlugin {...pluginProps} options={options} trigger={trigger} />
        ),
        position: 'floatingAnchorElem',
      },
    ],
    sanitizedClientFeatureProps: props,
    toolbarFixed: {
      groups: [toolbarGroup],
    },
  }
})
