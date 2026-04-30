import mongoose, { Schema, type Types } from 'mongoose'
import type { LoanStatus } from '@/types/shared'

export type LoanDoc = {
  applicationId: Types.ObjectId
  userId: Types.ObjectId
  principal: number
  tenureDays: number
  interestRate: number
  simpleInterest: number
  totalRepayment: number
  amountPaid: number
  outstandingBalance: number
  status: LoanStatus
  disbursedAt?: Date
  closedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type LoanVirtuals = {
  remainingBalance: number
}

const loanStatusValues: LoanStatus[] = ['sanctioned', 'disbursed', 'closed']

const loanSchema = new Schema<LoanDoc, mongoose.Model<LoanDoc>, Record<string, never>, LoanVirtuals>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    principal: { type: Number, required: true },
    tenureDays: { type: Number, required: true },
    interestRate: { type: Number, required: true, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    outstandingBalance: { type: Number, required: true },
    status: { type: String, required: true, enum: loanStatusValues },
    disbursedAt: { type: Date, required: false },
    closedAt: { type: Date, required: false }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const out = ret as unknown as Record<string, unknown>
        delete out.__v
        return out
      }
    }
  }
)

loanSchema.virtual('remainingBalance').get(function () {
  const doc = this as unknown as LoanDoc
  const value = Number(doc.totalRepayment) - Number(doc.amountPaid)
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.round((value + Number.EPSILON) * 100) / 100
})

export const Loan = mongoose.models.Loan
  ? (mongoose.models.Loan as mongoose.Model<LoanDoc>)
  : mongoose.model<LoanDoc>('Loan', loanSchema)
