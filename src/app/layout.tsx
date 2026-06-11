import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js Starter',
  description: 'Minimal Next.js 14 starter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
