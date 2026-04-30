import type { Request, Response } from 'express'
import { Loan } from '@/models/Loan'
import { Application } from '@/models/Application'

export const listLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'sanctioned' })
      .sort({ createdAt: -1 })
      .populate({ path: 'applicationId', match: { status: 'sanctioned' } })
      .populate('userId')
      .exec()

    const filtered = loans.filter((l) => Boolean(l.applicationId))
    res.status(200).json({ success: true, data: filtered.map((l) => l.toJSON()) })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export const disburseLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params?.id ?? '').trim()
    if (id.length === 0) {
      res.status(400).json({ success: false, message: 'id is required' })
      return
    }

    const loan = await Loan.findById(id)
    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found' })
      return
    }

    if (loan.status !== 'sanctioned') {
      res.status(409).json({ success: false, message: 'Loan is not in sanctioned status' })
      return
    }

    loan.status = 'disbursed'
    loan.disbursedAt = new Date()

    const updatedLoan = await loan.save()

    await Application.findByIdAndUpdate(loan.applicationId, { $set: { status: 'disbursed' } })

    res.status(200).json({ success: true, data: updatedLoan.toJSON() })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
