import { Router } from 'express'
import { verifyToken } from '@/middleware/verifyToken'
import { authorizeRoles } from '@/middleware/authorizeRoles'
import { listLeads } from '@/controllers/salesController'

export const salesRoutes = Router()

salesRoutes.use(verifyToken)
salesRoutes.use(authorizeRoles('sales', 'admin'))

salesRoutes.get('/leads', listLeads)
