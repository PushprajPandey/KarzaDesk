import { Router } from 'express'
import { verifyToken } from '@/middleware/verifyToken'
import { authorizeRoles } from '@/middleware/authorizeRoles'
import { disburseLoan, listLoans } from '@/controllers/disbursementController'

export const disbursementRoutes = Router()

disbursementRoutes.use(verifyToken)
disbursementRoutes.use(authorizeRoles('disbursement', 'admin'))

disbursementRoutes.get('/loans', listLoans)
disbursementRoutes.post('/loans/:id/disburse', disburseLoan)
