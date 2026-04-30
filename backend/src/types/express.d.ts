import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    fileValidationError?: string
  }
}
import type { IUserSafe } from '@/types/shared'

declare global {
  namespace Express {
    interface Request {
      user?: IUserSafe
    }
  }
}

export {}
