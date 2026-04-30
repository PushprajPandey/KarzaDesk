import type { User } from '@/types'

const tokenKey = 'lms_token'
const userKey = 'lms_user'

export const storage = {
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    const raw = window.localStorage.getItem(tokenKey)
    return raw && raw.trim().length > 0 ? raw : null
  },
  setToken(token: string): void {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(tokenKey, token)
  },
  clearToken(): void {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(tokenKey)
  },
  getUser(): User | null {
    if (typeof window === 'undefined') {
      return null
    }
    const raw = window.localStorage.getItem(userKey)
    if (!raw) {
      return null
    }
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },
  setUser(user: User): void {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(userKey, JSON.stringify(user))
  },
  clearUser(): void {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(userKey)
  },
  clearAll(): void {
    this.clearToken()
    this.clearUser()
  }
}
