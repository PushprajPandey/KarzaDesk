import type { UserRole } from '@/types'

export type JwtPayload = {
  userId: string
  role: UserRole
  exp?: number
}

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return atob(padded)
}

export const parseJwt = (token: string): JwtPayload | null => {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }
  try {
    const json = decodeBase64Url(parts[1])
    const parsed = JSON.parse(json) as JwtPayload
    if (!parsed || typeof parsed.userId !== 'string' || typeof parsed.role !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const isExpired = (payload: JwtPayload): boolean => {
  if (!payload.exp) {
    return false
  }
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now
}
