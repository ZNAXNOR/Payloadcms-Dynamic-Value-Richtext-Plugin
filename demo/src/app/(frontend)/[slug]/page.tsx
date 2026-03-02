import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import RichText from '@/components/RichText'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { Hero } from './Hero'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'documents',
    limit: 100,
    draft: false,
  })

  return docs.map((doc) => ({
    slug: doc.slug,
  }))
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'documents',
    draft,
    where: {
      slug: { equals: slug },
    },
  })

  if (!docs.length) return notFound()

  const doc = docs[0]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[var(--color-brand)]/30">
      {draft && (
        <div className="sticky top-0 z-100 bg-[var(--color-brand)] text-white shadow-xl animate-in fade-in slide-in-from-top duration-500">
          <div className="container max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-100 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-50"></span>
              </span>
              <span className="text-sm font-semibold tracking-wide uppercase">
                Draft Mode Active
              </span>
            </div>
            <Link
              href="/next/exit-preview"
              className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-white/20 active:scale-95"
            >
              Exit Preview
            </Link>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto content-center pt-16 pb-24">
        <Hero title={doc.title} description={doc.metaDescription} lastUpdated={doc.updatedAt} />

        <div className="container max-w-4xl mx-auto px-6 pb-32">
          {doc.content && (
            <RichText
              data={doc.content}
              enableGutter={false}
              className="max-w-none prose-lg md:prose-xl" // Larger text for a premium editorial feel
              dynamicData={doc as any}
            />
          )}
        </div>
      </main>
    </div>
  )
}
