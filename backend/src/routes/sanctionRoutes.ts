import { Router } from 'express'
import { verifyToken } from '@/middleware/verifyToken'
import { authorizeRoles } from '@/middleware/authorizeRoles'
import { approveApplication, listApplications, rejectApplication } from '@/controllers/sanctionController'

export const sanctionRoutes = Router()

sanctionRoutes.use(verifyToken)
sanctionRoutes.use(authorizeRoles('sanction', 'admin'))

sanctionRoutes.get('/applications', listApplications)
sanctionRoutes.post('/applications/:id/approve', approveApplication)
sanctionRoutes.post('/applications/:id/reject', rejectApplication)
