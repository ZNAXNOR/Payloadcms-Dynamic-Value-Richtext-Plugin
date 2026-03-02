---
description: Root, collection, global, and field components with performance, patterns, and troubleshooting
---

# Custom Components – Advanced Usage

This document covers advanced customization including root components, field UI, hooks, styling, performance optimization, and troubleshooting.

---

## Root Components

Root components affect the entire Admin Panel.

### Available Root Components

| Component | Purpose |
| ------- | ------- |
| `Nav` | Sidebar navigation |
| `graphics.Logo` | Login logo |
| `graphics.Icon` | Small brand icon |
| `logout.Button` | Logout button |
| `actions` | Header actions |
| `beforeDashboard` | Content before dashboard |
| `afterDashboard` | Content after dashboard |
| `beforeLogin` | Before login form |
| `afterLogin` | After login form |
| `providers` | Custom React context |
| `views` | Custom admin views |

---

### Example: Custom Logo

```ts
export default buildConfig({
  admin: {
    components: {
      graphics: {
        Logo: '/components/Logo',
        Icon: '/components/Icon',
      },
    },
  },
})
````

---

## Collection Components

```ts
export const Posts = {
  slug: 'posts',
  admin: {
    components: {
      edit: {
        PreviewButton: '/components/PostPreview',
        SaveButton: '/components/Save',
      },
      list: {
        Header: '/components/ListHeader',
        beforeList: ['/components/Filters'],
        afterList: ['/components/Footer'],
      },
    },
  },
}
```

---

## Global Components

```ts
export const Settings = {
  slug: 'settings',
  admin: {
    components: {
      edit: {
        PreviewButton: '/components/SettingsPreview',
      },
    },
  },
}
```

---

## Field Components

### Edit View Field

```ts
{
  name: 'status',
  type: 'select',
  admin: {
    components: {
      Field: '/components/StatusField',
    },
  },
}
```

```tsx
'use client'
import { useField } from '@payloadcms/ui'

export function StatusField({ path }) {
  const { value, setValue } = useField({ path })
  return <input value={value} onChange={(e) => setValue(e.target.value)} />
}
```

---

### Cell Component (List View)

```ts
{
  name: 'status',
  type: 'select',
  admin: {
    components: {
      Cell: '/components/StatusCell',
    },
  },
}
```

---

### UI Field (No Data)

```ts
{
  name: 'refund',
  type: 'ui',
  admin: {
    components: {
      Field: '/components/RefundButton',
    },
  },
}
```

---

## Styling Components

### CSS Variables

```scss
.my-component {
  background: var(--theme-elevation-500);
  color: var(--theme-text);
  padding: var(--base);
}
```

### Payload SCSS Mixins

```scss
@import '~@payloadcms/ui/scss';

.my-component {
  @include mid-break {
    background: var(--theme-elevation-900);
  }
}
```

---

## Common Patterns

### Conditional Field Visibility

```tsx
'use client'
import { useFormFields } from '@payloadcms/ui'

export function ConditionalField() {
  const enabled = useFormFields(([fields]) => fields.enable?.value)
  if (!enabled) return null
  return <input />
}
```

---

### Local API in Server Components

```tsx
async function RelatedPosts({ payload, id }) {
  const post = await payload.findByID({ collection: 'posts', id })

  const related = await payload.find({
    collection: 'posts',
    where: {
      category: { equals: post.category },
      id: { not_equals: id },
    },
  })

  return <div>{related.docs.length}</div>
}
```

---

## Performance Best Practices

### 1. Prefer Server Components

* No JS sent to browser
* Faster admin load
* Full Local API access

Use client components **only when required**.

---

### 2. Optimize Re-renders

```tsx
// BAD
useForm()

// GOOD
useFormFields(([fields]) => fields.title)
```

---

### 3. Reduce Client Bundle Size

```ts
// BAD
import { Button } from '@payloadcms/ui'

// GOOD
import { Button } from '@payloadcms/ui/elements/Button'
```

---

### 4. React Optimization

* Use `React.memo`
* Avoid inline callbacks
* Use stable keys
* Prefer Suspense boundaries

---

## Import Map

Payload generates:

```
app/(payload)/admin/importMap.js
```

Regenerate manually:

```bash
payload generate:importmap
```

Custom location:

```ts
admin: {
  importMap: {
    baseDir: path.resolve(dirname, 'src'),
    importMapFile: './app/custom-import-map.js',
  },
}
```

---

## Type Safety

```ts
import type {
  TextFieldServerComponent,
  TextFieldClientComponent,
  TextFieldCellComponent,
} from 'payload'
```

Use Payload-provided types for full IntelliSense.

---

## Troubleshooting

### Hooks Undefined

**Cause:** version mismatch.

**Fix:**

```json
{
  "payload": "3.0.0",
  "@payloadcms/ui": "3.0.0",
  "@payloadcms/richtext-lexical": "3.0.0"
}
```

---

### Component Not Loading

1. Verify path and baseDir
2. Check named export syntax
3. Regenerate import map
4. Check build errors

---

## Key Takeaways

* Default to server components
* Keep client components minimal
* Use hooks selectively
* Optimize re-renders
* Treat Admin UI like production frontend