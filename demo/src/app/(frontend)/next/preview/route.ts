import { draftMode, headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export const GET = async (req: Request): Promise<Response> => {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  const collection = searchParams.get('collection') as string
  const slug = searchParams.get('slug') as string
  const previewSecret = searchParams.get('previewSecret')

  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (previewSecret !== process.env.PREVIEW_SECRET && !user && !req.headers.get('Authorization')) {
    console.error('Preview access denied:', {
      providedSecret: previewSecret,
      expectedSecret: process.env.PREVIEW_SECRET ? 'SET' : 'NOT SET',
      hasUser: !!user,
    })
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path) {
    return new Response('No path provided', { status: 404 })
  }

  if (!collection || !slug) {
    return new Response('No collection or slug provided', { status: 404 })
  }

  const { docs } = await payload.find({
    collection: collection as any,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  if (!docs[0]) {
    return new Response('Document not found', { status: 404 })
  }

  ;(await draftMode()).enable()

  return redirect(path)
}
