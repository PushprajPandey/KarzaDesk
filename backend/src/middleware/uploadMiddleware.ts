import type { Request, RequestHandler } from 'express'
import multer from 'multer'
import type { FileFilterCallback } from 'multer'
// NOTE:
// This project is deployed to Vercel as a serverless function.
// Writing uploads to the local filesystem (e.g. process.cwd()) will fail or be non-persistent.
// Use memory storage and persist the file elsewhere (we store it in MongoDB in borrowerController).

const allowedMime = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])

const storage = multer.memoryStorage()

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
