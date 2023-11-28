'use client'

import { useState, useEffect } from 'react'
import { Equations } from '../../components/Equations'

export default function Terme() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  if (!loaded) return null

  return <Equations />
}
