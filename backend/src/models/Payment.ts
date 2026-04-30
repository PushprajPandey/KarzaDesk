import mongoose, { Schema, type Types } from 'mongoose'

export type PaymentDoc = {
  loanId: Types.ObjectId
  recordedBy: Types.ObjectId
  utrNumber: string
  amount: number
  paymentDate: Date
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<PaymentDoc>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    utrNumber: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true }
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

paymentSchema.index({ utrNumber: 1 }, { unique: true })
paymentSchema.index({ loanId: 1 })

export const Payment = mongoose.models.Payment
  ? (mongoose.models.Payment as mongoose.Model<PaymentDoc>)
  : mongoose.model<PaymentDoc>('Payment', paymentSchema)
