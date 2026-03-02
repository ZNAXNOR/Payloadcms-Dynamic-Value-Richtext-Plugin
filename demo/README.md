# Plugin Demo

A local demo application for the [`@od-labs/payloadcms-dynamic-value-richtext`](https://www.npmjs.com/package/@od-labs/payloadcms-dynamic-value-richtext) plugin.

This is a standalone Payload CMS app pre-configured with the plugin so you can explore and test its features without modifying your own project.

---

## Prerequisites

- Node.js `^18.20.2 || >=20.9.0`
- pnpm `^9 || ^10`

---

## Setup

### 1. Install dependencies

From this directory:

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable         | Description                             |
| ---------------- | --------------------------------------- |
| `DATABASE_URL`   | SQLite file path, e.g. `file:./demo.db` |
| `PAYLOAD_SECRET` | Any secret string for JWT signing       |

### 3. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) in your browser. On first run, you'll be prompted to create your first admin user.

---

## What this demo shows

| Feature               | Description                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DynamicValueFeature` | Adds a dynamic value picker to the Lexical rich text toolbar. Editors can insert references to live collection data (names, URLs, phone numbers, etc.) that resolve at render time. |
| `dynamicValuePlugin`  | Registers the necessary Payload collections and fields to store and resolve dynamic values across the app.                                                                          |

### Trying it out

1. Log in at `/admin`.
2. Open a **Post** and edit its rich text field.
3. Click the **Dynamic Value** button in the toolbar.
4. Choose a source collection and field from the popup menu.
5. Save the document.

The inserted node will render as a resolved value on the frontend. See the [plugin README](../README.md) for frontend integration details (`DynamicValueRichText` component and `DynamicValueJSXConverters`).

---

## Scripts

| Script                    | Description                          |
| ------------------------- | ------------------------------------ |
| `pnpm dev`                | Start the Next.js dev server         |
| `pnpm build`              | Build the Next.js app for production |
| `pnpm generate:types`     | Regenerate Payload TypeScript types  |
| `pnpm generate:importmap` | Regenerate the admin import map      |
