import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Loan } from '@/models/Loan'
import { Payment } from '@/models/Payment'
import { Application } from '@/models/Application'
import { round2 } from '@/utils/numbers'

const toNumber = (value: unknown): number | null => {
  const num = typeof value === 'number' ? value : Number(String(value ?? ''))
  if (!Number.isFinite(num)) {
    return null
  }
  return num
}

export const listActiveLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'disbursed' })
      .sort({ createdAt: -1 })
      .populate('applicationId')
      .populate('userId')
      .exec()

    res.status(200).json({ success: true, data: loans.map((l) => l.toJSON()) })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  const authUserId = req.user?._id
  if (!authUserId) {
    res.status(401).json({ success: false, message: 'Authentication required' })
    return
  }

  const loanId = String(req.params?.id ?? '').trim()
  const utrNumber = String(req.body?.utrNumber ?? '').trim()
  const amountRaw = toNumber(req.body?.amount)
  const paymentDateRaw = String(req.body?.paymentDate ?? '').trim()

  if (loanId.length === 0) {
    res.status(400).json({ success: false, message: 'id is required' })
    return
  }

  if (utrNumber.length === 0) {
    res.status(400).json({ success: false, message: 'utrNumber is required' })
    return
  }

  if (amountRaw === null || amountRaw <= 0) {
    res.status(400).json({ success: false, message: 'amount must be greater than 0' })
    return
  }

  const paymentDate = new Date(paymentDateRaw)
  if (Number.isNaN(paymentDate.getTime())) {
    res.status(400).json({ success: false, message: 'Invalid paymentDate' })
    return
  }

  try {
    const existingUtr = await Payment.exists({ utrNumber })
    if (existingUtr) {
      res.status(409).json({ success: false, message: 'UTR number already exists' })
      return
    }

    const session = await mongoose.startSession()

    let paymentDoc: unknown = null
    let loanDoc: unknown = null
    let isClosed = false

    try {
      await session.withTransaction(async () => {
        const loan = await Loan.findById(loanId).session(session)
        if (!loan) {
          res.status(404).json({ success: false, message: 'Loan not found' })
          return
        }

        if (loan.status !== 'disbursed') {
          res.status(409).json({ success: false, message: 'Loan is not in disbursed status' })
          return
        }

        const amount = round2(amountRaw)
        const outstanding = round2(loan.outstandingBalance)

        if (amount > outstanding) {
          res.status(400).json({ success: false, message: 'Overpayment is not allowed' })
          return
        }

        const payment = await Payment.create(
          [
            {
              loanId: loan._id,
              recordedBy: new mongoose.Types.ObjectId(authUserId),
              utrNumber,
              amount,
              paymentDate
            }
          ],
          { session }
        )

        const newPaid = round2(loan.amountPaid + amount)
        const newOutstanding = round2(loan.outstandingBalance - amount)

        loan.amountPaid = newPaid
        loan.outstandingBalance = newOutstanding

        if (newOutstanding <= 0) {
          loan.status = 'closed'
          loan.closedAt = new Date()
          isClosed = true
          await Application.findByIdAndUpdate(loan.applicationId, { $set: { status: 'closed' } }, { session })
        }

        const savedLoan = await loan.save({ session })

        paymentDoc = payment[0].toJSON()
        loanDoc = savedLoan.toJSON()
      })
    } finally {
      await session.endSession()
    }

    if (res.headersSent) {
      return
    }

    res.status(201).json({ success: true, data: { payment: paymentDoc, loan: loanDoc, isClosed } })
  } catch (e) {
    const code = typeof e === 'object' && e && 'code' in e ? Number((e as { code: unknown }).code) : null
    if (code === 11000) {
      res.status(409).json({ success: false, message: 'UTR number already exists' })
      return
    }
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export const getLoanPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const loanId = String(req.params?.id ?? '').trim()
    if (loanId.length === 0) {
      res.status(400).json({ success: false, message: 'id is required' })
      return
    }

    const items = await Payment.find({ loanId })
      .sort({ paymentDate: -1 })
      .populate('recordedBy', 'fullName email role')
      .exec()

    res.status(200).json({ success: true, data: items.map((p) => p.toJSON()) })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
