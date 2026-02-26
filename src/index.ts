import type { Config } from 'payload'
import type { DynamicValueConfig } from './features/DynamicValue/types.js'

export type { DynamicValueConfig, DynamicValueOption } from './features/DynamicValue/types.js'

export const dynamicValuePlugin =
  (pluginOptions: DynamicValueConfig) =>
  (config: Config): Config => {
    // Standard plugin wrapper
    return config
  }
