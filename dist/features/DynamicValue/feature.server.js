import { createNode, createServerFeature } from '@payloadcms/richtext-lexical';
import { DynamicValueNode } from '../../nodes/DynamicValueNode/index.js';
export const DynamicValueFeature = createServerFeature({
    feature: ({ config: payloadConfig, props: featureProps })=>{
        const pluginOptions = payloadConfig.custom?.dynamicValue || {};
        const props = {
            ...pluginOptions,
            ...featureProps || {}
        };
        const options = [];
        const trigger = props?.trigger || '@';
        console.log('[DynamicValueFeature] Options:', options.length);
        console.log('[DynamicValueFeature] Trigger:', trigger);
        const flattenFields = (fields, prefix = '')=>{
            if (!Array.isArray(fields)) {
                console.log(`[DynamicValueFeature] fields is not an array:`, typeof fields);
                return;
            }
            console.log(`[DynamicValueFeature] Flattening ${fields.length} fields with prefix "${prefix}"`);
            fields.forEach((field)=>{
                const isNested = 'name' in field && field.name;
                const newPrefix = isNested ? prefix ? `${prefix}.${field.name}` : field.name : prefix;
                console.log(`[DynamicValueFeature] Processing field: ${field.name} (${field.type}) -> prefix: ${newPrefix}`);
                if (isNested && ![
                    'array',
                    'blocks',
                    'richText',
                    'ui',
                    'upload'
                ].includes(field.type)) {
                    const label = typeof field.label === 'string' ? field.label : field.name;
                    console.log(`[DynamicValueFeature] Adding option: ${label} = ${newPrefix}`);
                    options.push({
                        label,
                        value: newPrefix
                    });
                }
                if ('fields' in field && Array.isArray(field.fields)) {
                    flattenFields(field.fields, newPrefix);
                }
                if (field.type === 'tabs' && Array.isArray(field.tabs)) {
                    field.tabs.forEach((tab)=>{
                        if (tab.fields) {
                            flattenFields(tab.fields, prefix);
                        }
                    });
                }
            });
        };
        if (props?.fields) {
            console.log('[DynamicValueFeature] Processing props.fields');
            flattenFields(props.fields);
        }
        if (props?.collections && payloadConfig.collections) {
            const collectionSlugs = Array.isArray(props.collections) ? props.collections : Object.entries(props.collections).filter(([_, enabled])=>enabled).map(([slug])=>slug);
            console.log('[DynamicValueFeature] Processing collections:', collectionSlugs);
            collectionSlugs.forEach((slug)=>{
                const collection = payloadConfig.collections?.find((c)=>c.slug === slug);
                if (collection) {
                    console.log(`[DynamicValueFeature] Found collection: ${slug}, flattening fields`);
                    flattenFields(collection.fields, slug);
                } else {
                    console.log(`[DynamicValueFeature] Collection not found: ${slug}`);
                }
            });
        }
        if (props?.globals && payloadConfig.globals) {
            const globalSlugs = Array.isArray(props.globals) ? props.globals : Object.entries(props.globals).filter(([_, enabled])=>enabled).map(([slug])=>slug);
            console.log('[DynamicValueFeature] Processing globals:', globalSlugs);
            globalSlugs.forEach((slug)=>{
                const global = payloadConfig.globals?.find((g)=>g.slug === slug);
                if (global) {
                    console.log(`[DynamicValueFeature] Found global: ${slug}, flattening fields`);
                    flattenFields(global.fields, slug);
                } else {
                    console.log(`[DynamicValueFeature] Global not found: ${slug}`);
                }
            });
        }
        return {
            ClientFeature: '@od-labs/payloadcms-dynamic-value-richtext/client#DynamicValueFeatureClient',
            clientFeatureProps: {
                options,
                trigger
            },
            key: 'dynamicValue',
            nodes: [
                createNode({
                    converters: {
                        html: {
                            converter: ({ node })=>{
                                return `<span data-payload-dynamic-value="true" data-payload-dynamic-field="${node.field}">${node.label}</span>`;
                            },
                            nodeTypes: [
                                'dynamic-value'
                            ]
                        },
                        text: {
                            converter: ({ node })=>{
                                return node.label;
                            },
                            nodeTypes: [
                                'dynamic-value'
                            ]
                        }
                    },
                    node: DynamicValueNode
                })
            ]
        };
    },
    key: 'dynamicValue'
});

//# sourceMappingURL=feature.server.js.map