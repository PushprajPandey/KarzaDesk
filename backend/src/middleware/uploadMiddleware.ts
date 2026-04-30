import type { Request, RequestHandler } from 'express'
import fs from 'fs'
import multer from 'multer'
import type { FileFilterCallback } from 'multer'
import path from 'path'
import { sanitizeFilename } from '@/utils/sanitize'

const ensureUploadsDir = (): string => {
  const dir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

const allowedMime = new Set(['application/pdf', 'image/jpeg', 'image/png'])

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    try {
      const dir = ensureUploadsDir()
      cb(null, dir)
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Failed to create uploads directory')
      cb(err, path.join(process.cwd(), 'uploads'))
    }
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname)
    const base = sanitizeFilename(path.basename(file.originalname, ext))
    cb(null, `${base}_${Date.now()}${ext}`)
  }
})

const uploader = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const ok = allowedMime.has(file.mimetype)
    if (!ok) {
      req.fileValidationError = 'Only PDF, JPG, JPEG, PNG files are allowed'
    }
    cb(null, ok)
  },
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('salarySlip')

export const uploadMiddleware: RequestHandler = (req, res, next) => {
  uploader(req, res, (err: unknown) => {
    if (req.fileValidationError) {
      res.status(400).json({ success: false, message: req.fileValidationError })
      return
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, message: 'File too large (max 5MB)' })
        return
      }
      res.status(400).json({ success: false, message: err.message })
      return
    }

    if (err instanceof Error) {
      res.status(400).json({ success: false, message: err.message })
      return
    }

    if (err) {
      res.status(400).json({ success: false, message: 'Upload failed' })
      return
    }

    next()
  })
}
