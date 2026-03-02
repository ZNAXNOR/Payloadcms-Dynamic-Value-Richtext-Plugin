import React from 'react'
import { cn } from '@/utilities/ui'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'

type Props = MediaBlockProps & {
  className?: string
  imgClassName?: string
  captionClassName?: string
  enableGutter?: boolean
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const { className, media, imgClassName } = props

  if (!media || typeof media !== 'object') return null

  return (
    <div className={cn('', className)}>
      <img
        className={cn('w-full h-auto', imgClassName)}
        src={media.url || ''}
        alt={media.alt || ''}
      />
    </div>
  )
}
