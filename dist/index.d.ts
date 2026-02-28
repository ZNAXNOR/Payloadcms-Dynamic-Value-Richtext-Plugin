import { DynamicValueFeature } from './features/DynamicValue/feature.server.js';
export { DynamicValueRichText } from './exports/react.js';
export { DynamicValueFeature } from './features/DynamicValue/feature.server.js';
export { DynamicValueNode } from './nodes/DynamicValueNode/index.js';
type PluginOptions = Parameters<typeof DynamicValueFeature>[0];
export declare const dynamicValuePlugin: (pluginOptions: PluginOptions) => (config: any) => any;
