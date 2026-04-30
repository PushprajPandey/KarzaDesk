import mongoose, { type HydratedDocument, Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import type { UserRole } from '@/types/shared'

export type UserDoc = {
  fullName: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserMethods = {
  comparePassword(candidate: string): Promise<boolean>
}

export type UserModel = mongoose.Model<UserDoc, Record<string, never>, UserMethods>

const roleValues: UserRole[] = ['admin', 'sales', 'sanction', 'disbursement', 'collection', 'borrower']

const userSchema = new Schema<UserDoc, UserModel, UserMethods>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: roleValues }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const out = ret as unknown as Record<string, unknown>
        delete out.password
        delete out.__v
        return out
      }
    }
  }
)

userSchema.index({ email: 1 }, { unique: true })

userSchema.pre('save', async function (next) {
  const doc = this as HydratedDocument<UserDoc, UserMethods>
  if (!doc.isModified('password')) {
    next()
    return
  }

  try {
    const hashed = await bcrypt.hash(doc.password, 10)
    doc.password = hashed
    next()
  } catch (e) {
    next(e as Error)
  }
})

userSchema.method('comparePassword', async function (candidate: string): Promise<boolean> {
  const doc = this as HydratedDocument<UserDoc, UserMethods>
  return bcrypt.compare(candidate, doc.password)
})

export const User = mongoose.models.User
  ? (mongoose.models.User as UserModel)
  : mongoose.model<UserDoc, UserModel>('User', userSchema)
