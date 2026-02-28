import { DynamicValueFeature } from './features/DynamicValue/feature.server.js'
export { DynamicValueFeature } from './features/DynamicValue/feature.server.js'
export { DynamicValueNode } from './nodes/DynamicValueNode/index.js'

export const dynamicValuePlugin = (pluginOptions: any) => (config: any) => {
  console.log('[DynamicValuePlugin] Initializing with options:', pluginOptions)
  if (!config.custom) {
    config.custom = {}
  }
  config.custom.dynamicValue = pluginOptions

  const injectIntoFields = (fields: any[]): any[] => {
    return fields.map((field) => {
      if (field.type === 'richText' && field.editor && typeof field.editor === 'object') {
        if ('features' in field.editor) {
          if (Array.isArray(field.editor.features)) {
            const hasFeature = field.editor.features.some((f: any) => f?.key === 'dynamicValue')
            if (!hasFeature) {
              field.editor.features.push(DynamicValueFeature())
            }
          } else if (typeof field.editor.features === 'function') {
            const originalFeatures = field.editor.features
            field.editor.features = (args: any) => {
              const features = originalFeatures(args)
              if (!features.some((f: any) => f?.key === 'dynamicValue')) {
                return [...features, DynamicValueFeature()]
              }
              return features
            }
          }
        }
      }

      if ('fields' in field && Array.isArray(field.fields)) {
        return { ...field, fields: injectIntoFields(field.fields) }
      }

      if (field.type === 'tabs' && Array.isArray(field.tabs)) {
        return {
          ...field,
          tabs: field.tabs.map((tab: any) => ({ ...tab, fields: injectIntoFields(tab.fields) })),
        }
      }

      if (field.type === 'blocks' && Array.isArray(field.blocks)) {
        return {
          ...field,
          blocks: field.blocks.map((block: any) => ({
            ...block,
            fields: injectIntoFields(block.fields),
          })),
        }
      }

      return field
    })
  }

  if (config.collections) {
    config.collections = config.collections.map((c: any) => ({
      ...c,
      fields: injectIntoFields(c.fields),
    }))
  }

  if (config.globals) {
    config.globals = config.globals.map((g: any) => ({
      ...g,
      fields: injectIntoFields(g.fields),
    }))
  }

  // Handle global editor if it exists
  if (config.editor && typeof config.editor === 'object' && 'features' in config.editor) {
    if (Array.isArray(config.editor.features)) {
      if (!config.editor.features.some((f: any) => f?.key === 'dynamicValue')) {
        config.editor.features.push(DynamicValueFeature())
      }
    } else if (typeof config.editor.features === 'function') {
      const originalFeatures = config.editor.features
      config.editor.features = (args: any) => {
        const features = originalFeatures(args)
        if (!features.some((f: any) => f?.key === 'dynamicValue')) {
          return [...features, DynamicValueFeature()]
        }
        return features
      }
    }
  }

  return config
}
