import type { RequestHandler } from 'express'

type RoleLike = string

export const authorizeRoles = (...roles: RoleLike[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }

    const allowed = roles.includes(user.role)
    if (!allowed) {
      res.status(403).json({ success: false, message: 'Access denied' })
      return
    }

    next()
  }
}
