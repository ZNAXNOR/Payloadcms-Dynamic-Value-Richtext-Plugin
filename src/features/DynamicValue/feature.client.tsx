'use client'
import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { $insertNodes } from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { LexicalTypeaheadMenuPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalTypeaheadMenuPlugin'
import { AtSign, Hash, Variable } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import * as ReactDOM from 'react-dom'

import type { DynamicValueOption } from './types.js'

import { $createDynamicValueNode, DynamicValueNode } from '../../nodes/DynamicValueNode/index.js'

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

const DynamicValuePlugin: React.FC<{
  anchorElem?: HTMLElement
  options: DynamicValueOption[]
  trigger: string
}> = ({ anchorElem, options: allOptions, trigger }) => {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState<null | string>(null)

  const checkForTriggerMatch = useTriggerMatch(trigger)

  const options = useMemo(() => {
    const searchString = queryString?.toLowerCase() || ''
    return (allOptions || [])
      .filter(
        (option: DynamicValueOption) =>
          option.label.toLowerCase().includes(searchString) ||
          option.value.toLowerCase().includes(searchString),
      )
      .map((opt: DynamicValueOption) => ({
        ...opt,
        key: opt.value,
      }))
  }, [queryString, allOptions])

  const TypeaheadMenu = LexicalTypeaheadMenuPlugin as any

  const IconToUse = trigger === '@' ? AtSign : trigger === '#' ? Hash : Variable

  return (
    <TypeaheadMenu
      anchorElem={anchorElem || (typeof document !== 'undefined' ? document.body : undefined)}
      menuRenderFn={(
        anchorElementRef: any,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }: any,
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
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.5 }}
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
      onSelectOption={(option: any, textNodeToReplace: any, closeMenu: any) => {
        editor.update(() => {
          if (textNodeToReplace) {
            textNodeToReplace.remove()
          }
          const node = $createDynamicValueNode(option.value, option.label)
          $insertNodes([node])
          closeMenu()
        })
      }}
      options={options}
      triggerFn={checkForTriggerMatch}
    />
  )
}

export const DynamicValueFeatureClient = createClientFeature<
  { options: DynamicValueOption[]; trigger: string },
  { options: DynamicValueOption[]; trigger: string }
>(({ props }) => {
  const options = props?.options || []
  const trigger = props?.trigger || '@'
  const IconToUse = trigger === '@' ? AtSign : trigger === '#' ? Hash : Variable

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
      groups: [
        {
          type: 'dropdown',
          ChildComponent: () => (
            <div style={{ alignItems: 'center', display: 'flex', gap: '4px' }}>
              <IconToUse size={14} style={{ color: 'var(--theme-text)', opacity: 0.7 }} />
            </div>
          ),
          items: options.map((field: DynamicValueOption) => ({
            key: field.value,
            label: field.label,
            onSelect: ({ editor }: { editor: any }) => {
              editor.update(() => {
                const node = $createDynamicValueNode(field.value, field.label)
                $insertNodes([node])
              })
            },
          })),
          key: 'dynamicValue',
          order: 99,
        },
      ],
    },
  }
})
