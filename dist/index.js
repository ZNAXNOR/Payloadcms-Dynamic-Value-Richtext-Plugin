import { DynamicValueFeature } from './features/DynamicValue/feature.server.js';
export { DynamicValueFeature } from './features/DynamicValue/feature.server.js';
export { DynamicValueNode } from './nodes/DynamicValueNode/index.js';
export const dynamicValuePlugin = (pluginOptions)=>(config)=>{
        console.log('[DynamicValuePlugin] Initializing with options:', pluginOptions);
        if (!config.custom) {
            config.custom = {};
        }
        config.custom.dynamicValue = pluginOptions;
        const injectIntoFields = (fields)=>{
            return fields.map((field)=>{
                if (field.type === 'richText' && field.editor && typeof field.editor === 'object') {
                    if ('features' in field.editor) {
                        if (Array.isArray(field.editor.features)) {
                            const hasFeature = field.editor.features.some((f)=>f?.key === 'dynamicValue');
                            if (!hasFeature) {
                                field.editor.features.push(DynamicValueFeature());
                            }
                        } else if (typeof field.editor.features === 'function') {
                            const originalFeatures = field.editor.features;
                            field.editor.features = (args)=>{
                                const features = originalFeatures(args);
                                if (!features.some((f)=>f?.key === 'dynamicValue')) {
                                    return [
                                        ...features,
                                        DynamicValueFeature()
                                    ];
                                }
                                return features;
                            };
                        }
                    }
                }
                if ('fields' in field && Array.isArray(field.fields)) {
                    return {
                        ...field,
                        fields: injectIntoFields(field.fields)
                    };
                }
                if (field.type === 'tabs' && Array.isArray(field.tabs)) {
                    return {
                        ...field,
                        tabs: field.tabs.map((tab)=>({
                                ...tab,
                                fields: injectIntoFields(tab.fields)
                            }))
                    };
                }
                if (field.type === 'blocks' && Array.isArray(field.blocks)) {
                    return {
                        ...field,
                        blocks: field.blocks.map((block)=>({
                                ...block,
                                fields: injectIntoFields(block.fields)
                            }))
                    };
                }
                return field;
            });
        };
        if (config.collections) {
            config.collections = config.collections.map((c)=>({
                    ...c,
                    fields: injectIntoFields(c.fields)
                }));
        }
        if (config.globals) {
            config.globals = config.globals.map((g)=>({
                    ...g,
                    fields: injectIntoFields(g.fields)
                }));
        }
        // Handle global editor if it exists
        if (config.editor && typeof config.editor === 'object' && 'features' in config.editor) {
            if (Array.isArray(config.editor.features)) {
                if (!config.editor.features.some((f)=>f?.key === 'dynamicValue')) {
                    config.editor.features.push(DynamicValueFeature());
                }
            } else if (typeof config.editor.features === 'function') {
                const originalFeatures = config.editor.features;
                config.editor.features = (args)=>{
                    const features = originalFeatures(args);
                    if (!features.some((f)=>f?.key === 'dynamicValue')) {
                        return [
                            ...features,
                            DynamicValueFeature()
                        ];
                    }
                    return features;
                };
            }
        }
        return config;
    };

//# sourceMappingURL=index.js.map