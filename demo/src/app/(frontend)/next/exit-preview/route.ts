import { draftMode } from 'next/headers'

export const GET = async (): Promise<Response> => {
  ;(await draftMode()).disable()
  return new Response('Draft mode is disabled')
}
