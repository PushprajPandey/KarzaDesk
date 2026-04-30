import type { Request, Response } from 'express'
import { User } from '@/models/User'

export const listLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await User.aggregate([
      { $match: { role: 'borrower' } },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'userId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          firstApplication: { $arrayElemAt: ['$applications', 0] }
        }
      },
      {
        $match: {
          $or: [
            { firstApplication: { $exists: false } },
            { firstApplication: null },
            { 'firstApplication.status': 'incomplete' }
          ]
        }
      },
      {
        $project: {
          password: 0,
          applications: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ])

    const mapped = rows.map((r) => {
      const app = r.firstApplication
      const status = app?.status ? String(app.status) : 'incomplete'
      return {
        user: {
          _id: String(r._id),
          fullName: String(r.fullName),
          email: String(r.email),
          role: String(r.role),
          createdAt: new Date(r.createdAt).toISOString(),
          updatedAt: new Date(r.updatedAt).toISOString()
        },
        applicationStatus: status === 'incomplete' ? 'Pending Application' : status
      }
    })

    res.status(200).json({ success: true, data: mapped })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
