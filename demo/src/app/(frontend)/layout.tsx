import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Payload CMS dynamic value richtext plugin demo.',
  title: 'Dynamic Value Richtext Plugin Demo',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
