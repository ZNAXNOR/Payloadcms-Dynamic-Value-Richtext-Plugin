import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { dynamicValuePlugin } from '@od-labs/payloadcms-dynamic-value-richtext'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Documents } from './collections/Documents/index'
import { Contacts } from './globals/Contacts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Documents],
  globals: [Contacts],
  plugins: [
    dynamicValuePlugin({
      collections: ['documents'],
      globals: ['contacts'],
      trigger: '@',
    }),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'demo-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./demo.db',
    },
  }),
  sharp: sharp as any,
})
