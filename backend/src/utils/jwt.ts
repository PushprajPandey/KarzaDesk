import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

export type JwtShape = {
  userId: string
  role: string
}

export const signJwt = (payload: JwtShape): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
}
