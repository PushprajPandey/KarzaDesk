import { Router } from 'express'
import { verifyToken } from '@/middleware/verifyToken'
import { authorizeRoles } from '@/middleware/authorizeRoles'
import { getLoanPayments, listActiveLoans, recordPayment } from '@/controllers/collectionController'

export const collectionRoutes = Router()

collectionRoutes.use(verifyToken)
collectionRoutes.use(authorizeRoles('collection', 'admin'))

collectionRoutes.get('/loans', listActiveLoans)
collectionRoutes.post('/loans/:id/payments', recordPayment)
collectionRoutes.get('/loans/:id/payments', getLoanPayments)
