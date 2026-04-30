import type { Response } from 'express'

export const ok = <T>(res: Response, data: T, statusCode = 200): void => {
  res.status(statusCode).json({ success: true, data })
}

export const fail = (res: Response, message: string, statusCode: number): void => {
  res.status(statusCode).json({ success: false, message })
}
