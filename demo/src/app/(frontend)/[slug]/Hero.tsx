import React from 'react'

type Props = {
  title: string
  description?: string | null
  lastUpdated?: string | null
}

export const Hero: React.FC<Props> = ({ title, description, lastUpdated }) => {
  const formattedDate = lastUpdated
    ? new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(lastUpdated))
    : ''

  return (
    <section className="py-24 lg:py-32">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-0.5 w-12 bg-blue-600"></div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">
            Document
          </span>
        </div>
        <div>
          <h1 className="text-5xl leading-[1.1] font-extrabold tracking-tight text-foreground md:text-7xl lg:text-8xl mb-8">
            {title || 'Information'}
          </h1>
          {description && (
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-light">
              {description}
            </p>
          )}
        </div>
        {lastUpdated && (
          <div className="mt-16 pt-10 border-t border-border/50">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase opacity-70">
                Last Updated
              </span>
              <span className="text-sm font-medium text-foreground/90">{formattedDate}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
