import { Metadata } from 'next'

import 'tailwindcss/tailwind.css'
import './faicon.css'

export const metadata: Metadata = {
  title: 'TERMinator',
  description:
    'Löse Algebra-Aufgaben in fortlaufender Rechnung mit durchgehendem Feedback',
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
