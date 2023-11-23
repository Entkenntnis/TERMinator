'use client'

import { useEffect, useState } from 'react'
import { App } from '../components/App'

export default function Index() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  if (!loaded) return null

  return <App />
}
