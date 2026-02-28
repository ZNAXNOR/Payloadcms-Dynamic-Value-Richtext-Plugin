import { DynamicValueFeature } from './features/DynamicValue/feature.server.js'

export { DynamicValueRichText } from './exports/react.js'

export { DynamicValueFeature } from './features/DynamicValue/feature.server.js'
export { DynamicValueNode } from './nodes/DynamicValueNode/index.js'

type PluginOptions = Parameters<typeof DynamicValueFeature>[0]

type FieldLike = {
  blocks?: Array<{ fields: FieldLike[] }>
  editor?: {
    features?: ((args: unknown) => any[]) | any[]
  }
  fields?: FieldLike[]
  tabs?: Array<{ fields: FieldLike[] }>
  type?: string
}

const ensureDynamicFeature = (features: any[]): any[] => {
  if (features.some((feature) => feature?.key === 'dynamicValue')) {
    return features
  }

  return [...features, DynamicValueFeature()]
}

const injectIntoFields = (fields: FieldLike[]): FieldLike[] => {
  return fields.map((field) => {
    const nextField: FieldLike = { ...field }

    if (field.type === 'richText' && field.editor && typeof field.editor === 'object') {
      const nextEditor = { ...field.editor }

      if (Array.isArray(nextEditor.features)) {
        nextEditor.features = ensureDynamicFeature(nextEditor.features)
      } else if (typeof nextEditor.features === 'function') {
        const originalFeatures = nextEditor.features
        nextEditor.features = (args) => ensureDynamicFeature(originalFeatures(args))
      }

      nextField.editor = nextEditor
    }

    if (Array.isArray(field.fields)) {
      nextField.fields = injectIntoFields(field.fields)
    }

    if (Array.isArray(field.tabs)) {
      nextField.tabs = field.tabs.map((tab) => ({
        ...tab,
        fields: injectIntoFields(tab.fields),
      }))
    }

    if (field.type === 'blocks' && Array.isArray(field.blocks)) {
      nextField.blocks = field.blocks.map((block) => ({
        ...block,
        fields: injectIntoFields(block.fields),
      }))
    }

    return nextField
  })
}

export const dynamicValuePlugin = (pluginOptions: PluginOptions) => (config: any) => {
  const nextConfig = { ...config }

  nextConfig.custom = {
    ...(nextConfig.custom || {}),
    dynamicValue: pluginOptions,
  }

  if (Array.isArray(nextConfig.collections)) {
    nextConfig.collections = nextConfig.collections.map((collection: any) => ({
      ...collection,
      fields: injectIntoFields(collection.fields),
    }))
  }

  if (Array.isArray(nextConfig.globals)) {
    nextConfig.globals = nextConfig.globals.map((globalConfig: any) => ({
      ...globalConfig,
      fields: injectIntoFields(globalConfig.fields),
    }))
  }

  if (nextConfig.editor && typeof nextConfig.editor === 'object' && 'features' in nextConfig.editor) {
    if (Array.isArray(nextConfig.editor.features)) {
      nextConfig.editor.features = ensureDynamicFeature(nextConfig.editor.features)
    } else if (typeof nextConfig.editor.features === 'function') {
      const originalFeatures = nextConfig.editor.features
      nextConfig.editor.features = (args: unknown) => ensureDynamicFeature(originalFeatures(args))
    }
  }

  return nextConfig
}

