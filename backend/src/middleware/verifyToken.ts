import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '@/config/env'
import { User } from '@/models/User'
import type { IUserSafe } from '@/types/shared'

type TokenPayload = {
  userId: string
  role: string
  iat?: number
  exp?: number
}

const authFail = (res: Response): void => {
  res.status(401).json({ success: false, message: 'Authentication required' })
}

const pickBearer = (value: string | undefined): string | null => {
  if (!value) {
    return null
  }
  const parts = value.split(' ')
  if (parts.length !== 2) {
    return null
  }
  const [scheme, token] = parts
  if (scheme !== 'Bearer') {
    return null
  }
  if (!token || token.trim().length === 0) {
    return null
  }
  return token
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = pickBearer(req.header('Authorization'))
  if (!token) {
    authFail(res)
    return
  }

  let decoded: TokenPayload
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload
  } catch {
    authFail(res)
    return
  }

  if (!decoded?.userId) {
    authFail(res)
    return
  }

  try {
    const user = await User.findById(decoded.userId).select('-password').lean<IUserSafe | null>()
    if (!user) {
      authFail(res)
      return
    }

    req.user = {
      _id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString()
    }

    next()
  } catch {
    authFail(res)
  }
}
