import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

const BRAND = '#E94235'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const { docs: documents } = await payload.find({
    collection: 'documents',
    where: {
      _status: { equals: 'published' },
    },
    limit: 100,
    sort: '-updatedAt',
  })

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(233,66,53,0.16),_transparent_55%)]" />
      <main className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <section className="rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-14">
          <p className="mb-4 inline-flex rounded-full bg-[var(--brand-soft)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
            OD Labs Plugin Demo
          </p>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
            Dynamic values for Payload Lexical, ready for production.
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">
            This demo is now wired to the official dynamic value plugin flow. Add reusable tokens
            like <span className="font-semibold text-slate-800">@contacts.companyEmail</span> in
            rich text and render them safely on the frontend.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
              href={payloadConfig.routes.admin}
              style={{ backgroundColor: BRAND }}
            >
              {user ? 'Open Admin' : 'Sign in to Admin'}
            </Link>
            <a
              className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              href="https://github.com/OD-Labs/Payloadcms-Dynamic-Value-Richtext-Plugin"
              rel="noopener noreferrer"
              target="_blank"
            >
              View Source
            </a>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Published documents</h2>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
              {documents.length} total
            </span>
          </div>

          {documents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/${doc.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[var(--color-brand)] hover:shadow-[0_10px_35px_rgba(233,66,53,0.15)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{doc.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">/{doc.slug}</p>
                    </div>
                    <span className="text-slate-300 transition group-hover:text-[var(--color-brand)]">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
              No published documents yet. Create one in the admin to see it here.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
