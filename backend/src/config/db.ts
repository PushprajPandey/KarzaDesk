import mongoose from 'mongoose'

export const connectMongo = async (mongoUri: string): Promise<void> => {
  const hasUri = typeof mongoUri === 'string' && mongoUri.trim().length > 0
  if (!hasUri) {
    throw new Error('MONGO_URI is required')
  }

  if (mongoose.connection.readyState === 1) {
    return
  }

  await mongoose.connect(mongoUri)
}
