# Payload Dynamic Value Rich Text Plugin

A powerful [Payload CMS](https://payloadcms.com) plugin for the Lexical editor that allows you to designate field values as dynamic variables. These variables can be reused throughout your rich text content and are visually represented as interactive badges.

## Features

- **Inline Autocomplete**: Trigger a searchable list of available dynamic fields using `@` (default) or a custom character (like `#`).
- **Visual Badges**: Variables appear in the editor as clean, non-editable badges with a "VAR" prefix, making them distinct from regular text.
- **Automatic Field Resolution**: Pull fields automatically from specified Collections and Globals, or provide manually defined fields.
- **Unit Tokenization**: Variables are treated as single units—selecting or deleting them happens in a single action.
- **Clipboard Support**: Copy and paste dynamic values between editors or documents while maintaining their data integrity.
- **Light & Dark Mode**: Seamlessly integrates with Payload's admin UI theme.

## Installation

```bash
pnpm add payloadcms-dynamic-value-richtext
# or
npm install payloadcms-dynamic-value-richtext
```

## Basic Setup

Add the plugin to your `payload.config.ts`:

```typescript
import { buildConfig } from 'payload'
import { dynamicValuePlugin } from 'payloadcms-dynamic-value-richtext'

export default buildConfig({
  plugins: [
    dynamicValuePlugin({
      collections: ['company-settings', 'sites'],
      globals: ['contact-info'],
      trigger: '@',
    }),
  ],
  // ... rest of config
})
```

## Configuration

In your Lexical editor configuration, add the `DynamicValueFeature` to your list of features:

```typescript
import { DynamicValueFeature } from 'payloadcms-dynamic-value-richtext'

// In your collection/global field definition:
{
  name: 'content',
  type: 'richText',
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      DynamicValueFeature(),
    ],
  }),
}
```

### Plugin Options

| Option        | Type               | Description                                                             |
| :------------ | :----------------- | :---------------------------------------------------------------------- |
| `collections` | `CollectionSlug[]` | Automatically extract all text-based fields from these collections.     |
| `globals`     | `GlobalSlug[]`     | Automatically extract all text-based fields from these globals.         |
| `fields`      | `Field[]`          | Manually provide a list of Payload fields to be used as dynamic values. |
| `trigger`     | `string`           | The character that triggers the autocomplete popup. Defaults to `@`.    |

## How it Works

1. **Resolution**: The plugin recursively flattens the fields of your chosen collections and globals. For example, if you have a Global `contact-info` with a field `email`, it becomes available as `contact-info.email`.
2. **Injection**: When you type the trigger character in the editor, a popup appears showing all available fields.
3. **Storage**: The variable is stored as a custom `DecoratorNode` in Lexical, which holds a reference to the field path (`value`) and the display label.

## Development

To run the development environment:

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Create a `.env` in the `dev` folder (see `.env.example`)
4. Run development: `pnpm dev`

## Ownership

Created & Owned by **OD LABS**. This plugin is open and free for use to all under the MIT License.

## Contributions

Contributions are welcome! If you have ideas for improvements or find any issues, feel free to open a Pull Request or create an Issue.

## License

MIT
