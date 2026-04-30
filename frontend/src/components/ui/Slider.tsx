'use client'

import React from 'react'

type Props = {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  suffix?: string
  formatValue?: (value: number) => string
}

export function Slider({ label, min, max, step, value, onChange, suffix, formatValue }: Props): JSX.Element {
  const shown = formatValue ? formatValue(value) : String(value)

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        <div className="rounded-md bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-900">
          {shown}
          {suffix ? <span className="ml-1 text-slate-500">{suffix}</span> : null}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
      />
      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
