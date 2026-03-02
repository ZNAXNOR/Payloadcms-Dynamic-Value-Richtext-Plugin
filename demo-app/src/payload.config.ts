import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
// Importing from the published package path mirrors how real consumers wire the plugin in their apps.
import { dynamicValuePlugin, DynamicValueFeature } from '@od-labs/payloadcms-dynamic-value-richtext'
import path from 'path'
import { buildConfig, type CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Collection-level editor overrides keep this demo realistic by showing a per-collection
// Lexical setup that still benefits from plugin-driven dynamic value injection.
const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
    },
  ],
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages],
  // Global Lexical feature injection provides a safe fallback so every rich-text field
  // includes dynamic values, even before collection-specific editor configs are expanded.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, DynamicValueFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    // Registering the plugin at config level guarantees consumer projects get
    // dynamic value behavior without repeating setup in every collection.
    dynamicValuePlugin({
      collections: ['pages', 'users'],
      globals: [],
      trigger: '#',
      fields: [
        {
          name: 'siteName',
          type: 'text',
        },
      ],
    }),
  ],
})
