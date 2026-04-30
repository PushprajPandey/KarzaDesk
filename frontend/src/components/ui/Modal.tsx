'use client'

import React, { useEffect } from 'react'

type Props = {
  isOpen: boolean
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  onClose: () => void
}

export function Modal({ isOpen, title, children, footer, onClose }: Props): JSX.Element | null {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-6" onMouseDown={onClose}>
      <div
        className="w-full rounded-t-2xl bg-white p-5 shadow-lg md:max-w-xl md:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            type="button"
          >
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto">{children}</div>
        {footer ? <div className="mt-5 flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}
