import mongoose, { Schema, type Types } from 'mongoose'
import type { ApplicationStatus, EmploymentMode } from '@/types/shared'

export type ApplicationDoc = {
  userId: Types.ObjectId
  fullName: string
  pan: string
  dateOfBirth: Date
  monthlySalary: number
  employmentMode: EmploymentMode
  salarySlipUrl: string
  salarySlipOriginalName: string
  status: ApplicationStatus
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const statusValues: ApplicationStatus[] = ['incomplete', 'applied', 'sanctioned', 'rejected', 'disbursed', 'closed']
const employmentValues: EmploymentMode[] = ['salaried', 'self-employed', 'unemployed']

const applicationSchema = new Schema<ApplicationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true, trim: true },
    pan: { type: String, required: true, trim: true, uppercase: true },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentMode: { type: String, required: true, enum: employmentValues },
    salarySlipUrl: { type: String, required: true, default: '' },
    salarySlipOriginalName: { type: String, required: true, default: '' },
    status: { type: String, required: true, enum: statusValues, default: 'incomplete' },
    rejectionReason: { type: String, required: false }
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

applicationSchema.index({ userId: 1 })
applicationSchema.index({ status: 1 })

export const Application = mongoose.models.Application
  ? (mongoose.models.Application as mongoose.Model<ApplicationDoc>)
  : mongoose.model<ApplicationDoc>('Application', applicationSchema)
