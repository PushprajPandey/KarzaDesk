'use client'

import React from 'react'
import type { ApplicationStatus } from '@/types'

type Props = {
  status: ApplicationStatus
}

const steps: { key: ApplicationStatus; label: string }[] = [
  { key: 'incomplete', label: 'Details' },
  { key: 'applied', label: 'Applied' },
  { key: 'sanctioned', label: 'Sanctioned' },
  { key: 'disbursed', label: 'Disbursed' },
  { key: 'closed', label: 'Closed' }
]

const indexOf = (status: ApplicationStatus): number => {
  const idx = steps.findIndex((s) => s.key === status)
  if (idx >= 0) return idx
  if (status === 'rejected') return 1
  return 0
}

export function StatusStepper({ status }: Props): JSX.Element {
  const activeIndex = indexOf(status)

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((s, idx) => {
          const done = idx <= activeIndex && status !== 'rejected'
          const current = idx === activeIndex && status !== 'rejected'
          const pill = done ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
          const ring = current ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          return (
            <div key={s.key} className={'rounded-full px-4 py-2 text-xs font-bold ' + pill + (ring ? ` ${ring}` : '')}>
              {s.label}
            </div>
          )
        })}
        {status === 'rejected' ? <div className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-800">Rejected</div> : null}
      </div>
    </div>
  )
}
