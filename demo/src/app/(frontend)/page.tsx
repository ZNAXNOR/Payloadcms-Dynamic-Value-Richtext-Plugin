import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'

import Link from 'next/link'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Show all published documents
  const { docs: documents } = await payload.find({
    collection: 'documents',
    where: {
      _status: { equals: 'published' },
    },
    limit: 100,
    sort: '-updatedAt',
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white bg-[radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.5)_0%,_transparent_40%),_radial-gradient(circle_at_80%_80%,_rgba(147,51,234,0.5)_0%,_transparent_40%)] bg-fixed">
      <main className="max-w-[1000px] mx-auto px-8 py-32">
        <div className="text-center mb-32">
          <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-2 rounded-full font-extrabold text-[0.75rem] tracking-[2px] mb-6 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            OD LABS
          </div>
          <h1 className="text-[4rem] font-extrabold leading-[1.1] mb-6 tracking-[-1px] md:text-[2.5rem]">
            Payload CMS{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] [-webkit-text-stroke:1px_rgba(255,255,255,0.5)]">
              Dynamic Value
            </span>{' '}
            Richtext Plugin
          </h1>
          <p className="text-xl opacity-70 max-w-[600px] mx-auto mb-12">
            Experience the power of dynamic variables within your rich text editor.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              className="bg-white text-black px-8 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
              href={payloadConfig.routes.admin}
            >
              Manage Content
            </Link>
            <a
              className="bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:bg-white/10"
              href="https://github.com/OD-Labs/Payloadcms-Dynamic-Value-Richtext-Plugin"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub Repo
            </a>
          </div>
        </div>

        <section className="mt-16">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold">Published Documents</h2>
            <div className="bg-white/10 px-3 py-1 rounded-full text-[0.875rem] opacity-60">
              {documents.length} Found
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/${doc.slug}`}
                  className="group bg-white/[0.03] border border-white/[0.05] p-6 rounded-[1.25rem] flex justify-between items-center transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/30 hover:scale-[1.02] backdrop-blur-sm"
                >
                  <div className="">
                    <h3 className="font-semibold mb-1 text-white">{doc.title}</h3>
                    <code className="text-[0.8rem] opacity-50">/{doc.slug}</code>
                  </div>
                  <div className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                    →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/[0.03] rounded-[1.25rem] border border-dashed border-white/10 opacity-50">
              <p>No published documents found. Start by creating one in the admin panel!</p>
            </div>
          )}
        </section>
      </main>

      <footer className="text-center py-16 px-8 opacity-30 text-[0.875rem]">
        <p>Built with ❤️ by OD LABS</p>
      </footer>
    </div>
  )
}
