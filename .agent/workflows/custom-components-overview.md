---
description: Overview of custom component architecture, component types, paths, server vs client components, and props
---

# Custom Components in Payload CMS

Custom Components allow you to fully customize the Payload Admin Panel by replacing UI elements or adding entirely new functionality using React.

You can override nearly every part of the Admin UI while keeping your config lightweight and server-safe.

---

## Component Types

Payload supports four main component categories:

1. **Root Components** — Global Admin UI
2. **Collection Components** — Per-collection views
3. **Global Components** — Per-global document views
4. **Field Components** — Custom field UI and cells

---

## Defining Custom Components

### Component Paths

Components are defined using file paths instead of imports.

```ts
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    components: {
      logout: {
        Button: '/src/components/Logout#MyComponent',
      },
      Nav: '/src/components/Nav',
    },
  },
})
````

### Path Rules

1. Paths are relative to project root or `importMap.baseDir`
2. Named exports use `#ExportName`
3. Default exports require no suffix
4. File extensions may be omitted

---

## Component Config Object

Instead of a string path, you may pass a configuration object:

```ts
{
  logout: {
    Button: {
      path: '/components/Logout',
      exportName: 'MyComponent',
      clientProps: { customProp: 'value' },
      serverProps: { asyncData: someData },
    },
  },
}
```

### Config Properties

| Property      | Description                                  |
| ------------- | -------------------------------------------- |
| `path`        | File path to component                       |
| `exportName`  | Named export                                 |
| `clientProps` | Serializable props for client components     |
| `serverProps` | Non-serializable props for server components |

---

## Setting Base Directory

```ts
import path from 'path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
    },
    components: {
      Nav: '/components/Nav',
    },
  },
})
```

---

## Server vs Client Components

All custom components are **React Server Components by default**.

---

### Server Components (Default)

* Can access Payload Local API
* Support async operations
* No JS shipped to browser

```tsx
import type { Payload } from 'payload'

async function MyServerComponent({ payload }: { payload: Payload }) {
  const page = await payload.findByID({
    collection: 'pages',
    id: '123',
  })

  return <p>{page.title}</p>
}

export default MyServerComponent
```

---

### Client Components

Use `'use client'` when interactivity is required.

```tsx
'use client'
import { useState } from 'react'

export function MyClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>
}
```

**Important:**

* Client components must receive **serializable props only**
* Functions, class instances, and Payload objects are stripped automatically

---

## Default Props

All custom components receive:

| Prop      | Description        |
| --------- | ------------------ |
| `payload` | Local API instance |
| `i18n`    | Translation object |
| `locale`  | Active locale      |

### Server Example

```tsx
async function MyComponent({ payload, locale }) {
  const posts = await payload.find({
    collection: 'posts',
    locale,
  })

  return <div>{posts.docs.length} posts</div>
}
```

### Client Example

```tsx
'use client'
import { usePayload, useLocale, useTranslation } from '@payloadcms/ui'

export function MyComponent() {
  const { getLocal } = usePayload()
  const locale = useLocale()
  const { t } = useTranslation()

  return <div>{t('hello')}</div>
}
```

---

## Custom Props

```ts
{
  logout: {
    Button: {
      path: '/components/Logout',
      clientProps: {
        buttonText: 'Sign Out',
      },
    },
  },
}
```

```tsx
'use client'
export function Logout({ buttonText }) {
  return <button>{buttonText}</button>
}
```

---

## Using Hooks (Client Only)

```tsx
'use client'
import {
  useAuth,
  useConfig,
  useDocumentInfo,
  useField,
  useFormFields,
  useLocale,
  useTranslation,
  usePayload,
} from '@payloadcms/ui'
```

These hooks **only work inside the Admin Panel runtime**.
