import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Document as PayloadDocument } from '@/payload-types'

export const revalidateDocument: CollectionAfterChangeHook<PayloadDocument> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/${doc.slug}`

      payload.logger.info(`Revalidating document at path: ${path}`)

      revalidatePath(path)
      revalidateTag('documents-sitemap')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/${previousDoc.slug}`

      payload.logger.info(`Revalidating old document at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('documents-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<PayloadDocument> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('documents-sitemap')
  }

  return doc
}
