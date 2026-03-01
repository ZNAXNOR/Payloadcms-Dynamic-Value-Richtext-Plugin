'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import {
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  type LexicalNode,
} from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { LexicalTypeaheadMenuPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalTypeaheadMenuPlugin'
import { useForm } from '@payloadcms/ui'
import { AtSign, Hash, Variable } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
    <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', opacity: 0.8 }}>
      <IconToUse
        className="icon"
        focusable="false"
        size={14}
        strokeWidth={1.5}
        style={{ color: 'currentColor' }}
      />
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

  useEffect(() => {
    return editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        const target = event.target as HTMLElement
        const nodeElement = target.closest('.payload-dynamic-value-node')
        if (nodeElement) {
          editor.update(() => {
            const node = $getNearestNodeFromDOMNode(nodeElement)
            if ($isDynamicValueNode(node)) {
              node.select(0, node.getTextContentSize())
            }
          })
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

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
    <>
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
              className="slash-menu-popup"
              style={{
                maxHeight: '400px',
                minWidth: '260px',
                overflowY: 'auto',
                padding: '8px',
              }}
            >
              <div className="slash-menu-popup__group">
                <div className="slash-menu-popup__group-title">Dynamic Values</div>
                {options.map((option, index) => {
                  const isSelected = selectedIndex === index
                  return (
                    <button
                      aria-selected={isSelected}
                      className={`slash-menu-popup__item ${isSelected ? 'slash-menu-popup__item--selected' : ''}`}
                      key={option.value}
                      onClick={() => selectOptionAndCleanUp(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      role="option"
                      style={{ minHeight: '50px' }}
                      tabIndex={-1}
                      type="button"
                    >
                      <IconToUse
                        className="icon"
                        size={20}
                        strokeWidth={1.5}
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        className="slash-menu-popup__item-text"
                        style={{
                          alignItems: 'flex-start',
                          display: 'flex',
                          flex: '1',
                          flexDirection: 'column',
                          marginLeft: '8px',
                        }}
                      >
                        <span
                          className="text"
                          style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            lineHeight: 1.2,
                          }}
                        >
                          {option.label}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            lineHeight: 1.2,
                            marginTop: '2px',
                            opacity: 0.5,
                          }}
                        >
                          {option.value}
                        </span>
                      </span>
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
            const selection = $getSelection()
            let format = 0
            if ($isRangeSelection(selection)) {
              format = selection.format
            }

            const node = $createDynamicValueNode(option.value, option.label)
            node.setFormat(format)
            $insertNodes([node, $createTextNode(' ')])
            closeMenu()
          })
        }}
        options={options as any}
        triggerFn={checkForTriggerMatch as any}
      />
    </>
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
      aria-label={field.label}
      className="btn toolbar-popup__dropdown-item btn--icon btn--icon-style-none btn--size-medium btn--icon-position-left btn--style-none"
      data-item-key={field.value}
      onClick={(e) => {
        e.preventDefault()
        item.onSelect({ editor, isActive: false })
      }}
      style={{ minHeight: '50px', whiteSpace: 'nowrap' }}
      title={field.label}
      type="button"
    >
      <span className="btn__content" style={{ alignItems: 'center', display: 'flex' }}>
        <span
          className="btn__label"
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            marginLeft: '8px',
            marginRight: '8px',
          }}
        >
          <span className="text" style={{ fontSize: '13px', fontWeight: 500, lineHeight: '1.2' }}>
            {field.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: '1.2',
              marginTop: '2px',
              opacity: 0.5,
            }}
          >
            {field.value}
          </span>
        </span>
        <span className="btn__icon" style={{ flexShrink: 0 }}>
          <IconToUse size={20} strokeWidth={1.5} style={{ opacity: 0.4 }} />
        </span>
      </span>
    </button>
  )
}

export const DynamicValueFeatureClient = createClientFeature((args: any) => {
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
      editor.update(() => {
        const selection = $getSelection()
        let format = 0
        if ($isRangeSelection(selection)) {
          format = selection.format
        }

        const node = $createDynamicValueNode(field.value, field.label)
        node.setFormat(format)
        $insertNodes([node, $createTextNode(' ')])
      })
    },
    order: 1,
  }))

  const toolbarGroup = {
    type: 'dropdown' as const,
    ChildComponent: SelectIcon(trigger),
    items: groupItems,
    key: 'dynamic-value-toolbar-group', // Unique key to avoid Link feature collision
    order: 100,
  }

  return {
    nodes: [DynamicValueNode],
    plugins: [
      {
        Component: (pluginProps) => (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html:
                  '.payload-dynamic-value-node::selection { background-color: transparent; color: inherit; }',
              }}
            />
            <DynamicValuePlugin {...pluginProps} options={options} trigger={trigger} />
          </>
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
