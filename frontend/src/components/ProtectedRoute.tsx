'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { UserRole } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'

const roleHome = (role: UserRole): string => {
  if (role === 'borrower') return '/personal-details'
  if (role === 'admin') return '/admin'
  if (role === 'sales') return '/sales'
  if (role === 'sanction') return '/sanction'
  if (role === 'disbursement') return '/disbursement'
  return '/collection'
}

type Props = {
  allowedRoles?: UserRole[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: Props): JSX.Element {
  const { token, user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) {
      return
    }
    if (!token || !user) {
      router.replace('/login')
      return
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const dest = roleHome(user.role)
      if (pathname !== dest) {
        router.replace(dest)
      }
    }
  }, [allowedRoles, isLoading, pathname, router, token, user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  return <>{children}</>
}
