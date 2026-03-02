import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    // Aliases to resolve the plugin source directly during development
    if (webpackConfig.name === 'client' || webpackConfig.name === 'server') {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@od-labs/payloadcms-dynamic-value-richtext/client': path.resolve(
          dirname,
          '../src/exports/client.ts',
        ),
        '@od-labs/payloadcms-dynamic-value-richtext/server': path.resolve(
          dirname,
          '../src/exports/server.ts',
        ),
        '@od-labs/payloadcms-dynamic-value-richtext': path.resolve(dirname, '../src/index.ts'),
      }
    }

    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
