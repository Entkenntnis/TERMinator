'use client'

import { useState, useEffect } from 'react'
import { App } from '../../components/App'

export default function Terme() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  if (!loaded) return null

  return <App />
}
