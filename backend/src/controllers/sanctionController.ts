import type { Request, Response } from 'express'
import { Application } from '@/models/Application'
import { Loan } from '@/models/Loan'

const toInt = (value: unknown, fallback: number): number => {
  const n = Number(String(value ?? ''))
  if (!Number.isFinite(n)) {
    return fallback
  }
  return Math.max(1, Math.floor(n))
}

export const listApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = toInt(req.query?.page, 1)
    const limit = Math.min(100, toInt(req.query?.limit, 10))
    const skip = (page - 1) * limit

    const filter = { status: 'applied' as const }

    const [items, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email')
        .exec(),
      Application.countDocuments(filter)
    ])

    res.status(200).json({ success: true, data: { items: items.map((i) => i.toJSON()), page, limit, total } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export const approveApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params?.id ?? '').trim()
    if (id.length === 0) {
      res.status(400).json({ success: false, message: 'id is required' })
      return
    }

    const app = await Application.findById(id)
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' })
      return
    }

    if (app.status !== 'applied') {
      res.status(409).json({ success: false, message: 'Application is not in applied status' })
      return
    }

    app.status = 'sanctioned'
    app.rejectionReason = undefined
    const updatedApp = await app.save()

    const loan = await Loan.findOne({ applicationId: app._id })
    if (loan) {
      loan.status = 'sanctioned'
      await loan.save()
    }

    res.status(200).json({ success: true, data: { application: updatedApp.toJSON(), loan: loan ? loan.toJSON() : null } })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export const rejectApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params?.id ?? '').trim()
    const rejectionReason = String(req.body?.rejectionReason ?? '').trim()

    if (id.length === 0) {
      res.status(400).json({ success: false, message: 'id is required' })
      return
    }

    if (rejectionReason.length === 0) {
      res.status(400).json({ success: false, message: 'rejectionReason is required' })
      return
    }

    const app = await Application.findById(id)
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' })
      return
    }

    app.status = 'rejected'
    app.rejectionReason = rejectionReason

    const updated = await app.save()
    res.status(200).json({ success: true, data: updated.toJSON() })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
