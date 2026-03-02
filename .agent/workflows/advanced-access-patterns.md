---
description: Context-aware, time-based, subscription-based access patterns in Payload CMS
---

# Advanced Access Control Patterns

Advanced access control patterns including context-aware access, time-based restrictions, and subscription-aware permissions.

---

## Context-Aware Access Patterns

### Locale-Specific Access

```ts
import type { Access } from 'payload'

export const localeSpecificAccess: Access = ({ req: { user, locale } }) => {
  if (user) return true
  if (locale === 'en') return true
  return false
}
````

---

### Device-Specific Access

```ts
export const mobileOnlyAccess: Access = ({ req: { headers } }) => {
  const userAgent = headers?.get('user-agent') || ''
  return /mobile|android|iphone/i.test(userAgent)
}

export const desktopOnlyAccess: Access = ({ req: { headers } }) => {
  const userAgent = headers?.get('user-agent') || ''
  return !/mobile|android|iphone/i.test(userAgent)
}
```

---

### IP-Based Access

```ts
export const restrictedIpAccess = (allowedIps: string[]): Access => {
  return ({ req: { headers } }) => {
    const ip = headers?.get('x-forwarded-for') || headers?.get('x-real-ip')
    return allowedIps.includes(ip || '')
  }
}
```

```ts
// Usage
const internalIps = ['192.168.1.0/24', '10.0.0.5']

export const InternalDocs = {
  slug: 'internal-docs',
  access: {
    read: restrictedIpAccess(internalIps),
  },
}
```

---

## Time-Based Access Patterns

### Today's Records Only

```ts
export const todayOnlyAccess: Access = ({ req: { user } }) => {
  if (!user) return false

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

  return {
    createdAt: {
      greater_than_equal: start.toISOString(),
      less_than: end.toISOString(),
    },
  }
}
```

---

### Recent Records (Last N Days)

```ts
export const recentRecordsAccess = (days: number): Access => {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes('admin')) return true

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return {
      createdAt: {
        greater_than_equal: cutoff.toISOString(),
      },
    }
  }
}
```

---

### Scheduled Content Window

```ts
export const scheduledContentAccess: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin') || user?.roles?.includes('editor')) {
    return true
  }

  const now = new Date().toISOString()

  return {
    and: [
      { publishDate: { less_than_equal: now } },
      {
        or: [
          { unpublishDate: { exists: false } },
          { unpublishDate: { greater_than: now } },
        ],
      },
    ],
  }
}
```

---

## Subscription-Based Access

### Active Subscription Required

```ts
export const activeSubscriptionAccess: Access = async ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true

  try {
    const subscription = await req.payload.findByID({
      collection: 'subscriptions',
      id: user.subscriptionId,
    })

    return subscription?.status === 'active'
  } catch {
    return false
  }
}
```

---

### Tier-Based Subscription Access

```ts
export const tierBasedAccess = (requiredTier: string): Access => {
  const tiers = ['free', 'basic', 'pro', 'enterprise']

  return async ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes('admin')) return true

    try {
      const sub = await req.payload.findByID({
        collection: 'subscriptions',
        id: user.subscriptionId,
      })

      if (sub?.status !== 'active') return false

      return tiers.indexOf(sub.tier) >= tiers.indexOf(requiredTier)
    } catch {
      return false
    }
  }
}
```

---

## Factory Functions

### Role-Based Factory

```ts
export function createRoleBasedAccess(roles: string[]): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    return roles.some((role) => user.roles?.includes(role))
  }
}
```

---

### Organization-Scoped Factory

```ts
export function createOrgScopedAccess(allowAdmin = true): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (allowAdmin && user.roles?.includes('admin')) return true

    return {
      organizationId: { in: user.organizationIds || [] },
    }
  }
}
```

---

### Team-Based Factory

```ts
export function createTeamBasedAccess(teamField = 'teamId'): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes('admin')) return true

    return {
      [teamField]: { in: user.teamIds || [] },
    }
  }
}
```

---

### Time-Limited Factory

```ts
export function createTimeLimitedAccess(days: number): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes('admin')) return true

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return {
      createdAt: {
        greater_than_equal: cutoff.toISOString(),
      },
    }
  }
}
```
