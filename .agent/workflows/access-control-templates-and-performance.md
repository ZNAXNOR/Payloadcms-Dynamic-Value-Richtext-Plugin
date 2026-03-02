---
description: Production-ready access templates, performance optimizations, debugging, and best practices
---

# Access Control Templates & Performance

Production-safe collection templates, performance patterns, debugging strategies, and best practices for Payload CMS access control.

---

## Configuration Templates

### Public + Authenticated Collection

```ts
export const PublicAuthCollection = {
  slug: 'posts',
  access: {
    create: ({ req: { user } }) =>
      user?.roles?.some((r) => ['admin', 'editor'].includes(r)) || false,

    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },

    update: ({ req: { user } }) =>
      user?.roles?.some((r) => ['admin', 'editor'].includes(r)) || false,

    delete: ({ req: { user } }) =>
      user?.roles?.includes('admin') || false,
  },
  versions: { drafts: true },
}
````

---

### Self-Service User Collection

```ts
export const SelfServiceCollection = {
  slug: 'users',
  auth: true,
  access: {
    create: ({ req: { user } }) => user?.roles?.includes('admin') || false,
    read: () => true,

    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return user.id === id
    },

    delete: ({ req: { user } }) => user?.roles?.includes('admin') || false,
  },
}
```

---

## Performance Considerations

### Avoid Async in Hot Paths

```ts
// ❌ Slow
export const slowAccess: Access = async ({ req: { user } }) => {
  const org = await req.payload.findByID({ collection: 'orgs', id: user.orgId })
  return org.active
}
```

```ts
// ✅ Fast
export const fastAccess: Access = ({ req: { context } }) => {
  if (!context.orgActive) {
    context.orgActive = true
  }
  return context.orgActive
}
```

---

### Prefer Query Constraints

```ts
// ❌
export const slowQuery: Access = () => ({
  'metadata.internalCode': { equals: 'ABC123' },
})
```

```ts
// ✅
export const fastQuery: Access = () => ({
  status: { equals: 'active' },
})
```

---

### Avoid Access Logic Inside Arrays

```ts
// ❌ runs per item
read: async () => await expensiveCheck()
```

```ts
// ✅ cache once
read: ({ req: { context, user } }) => {
  if (context.allowed === undefined) {
    context.allowed = user?.roles?.includes('admin')
  }
  return context.allowed
}
```

---

### Avoid N+1 Queries

```ts
// ❌
export const n1Access: Access = async ({ req, id }) => {
  const doc = await req.payload.findByID({ collection: 'docs', id })
  return doc.isPublic
}
```

```ts
// ✅
export const efficientAccess: Access = () => ({
  isPublic: { equals: true },
})
```

---

## Debugging Techniques

### Log Access Execution

```ts
export const debugAccess: Access = ({ req: { user }, id }) => {
  console.log({
    userId: user?.id,
    roles: user?.roles,
    docId: id,
    time: new Date().toISOString(),
  })
  return true
}
```

---

### Inspect Access Arguments

```ts
export const checkArgsAccess: Access = (args) => {
  console.log({
    hasUser: !!args.req?.user,
    hasId: !!args.id,
    hasData: !!args.data,
  })
  return true
}
```

---

### Testing Public Access

```ts
const result = await payload.find({
  collection: 'posts',
  overrideAccess: false,
  user: undefined,
})

console.log(result.docs.length)
```

---

## Best Practices

1. Default deny, then allow
2. Keep access logic predictable
3. Prefer query constraints
4. Cache with `req.context`
5. Avoid async unless required
6. Test public vs authenticated
7. Log failed attempts
8. Re-audit rules quarterly
9. Index constraint fields
10. Document intent clearly
11. Never trust client data
12. Fail closed (return false)
13. Enforce `overrideAccess: false` in tests
14. Follow least-privilege principle
15. Optimize before scaling

---

## Performance Summary

* Use DB-level filtering whenever possible
* Cache expensive checks per request
* Avoid async in list views
* Avoid per-array-item access logic
* Keep access predictable and explainable