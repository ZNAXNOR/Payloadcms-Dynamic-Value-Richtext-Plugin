import type { Field } from 'payload';
export type DynamicValueFeatureProps = {
    collections?: string[];
    fields?: Field[];
    globals?: string[];
    trigger?: string;
};
export declare const DynamicValueFeature: import("@payloadcms/richtext-lexical").FeatureProviderProviderServer<DynamicValueFeatureProps, DynamicValueFeatureProps, any>;
