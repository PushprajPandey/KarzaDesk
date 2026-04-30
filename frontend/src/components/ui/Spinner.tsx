'use client'

import React from 'react'

export function Spinner({ size = 24 }: { size?: number }): JSX.Element {
  const s = Math.max(12, Math.min(64, Math.floor(size)))
  return (
    <div
      aria-label="Loading"
      className="inline-block animate-spin rounded-full border-2 border-slate-200 border-t-slate-700"
      style={{ width: s, height: s }}
    />
  )
}
