import { Router } from 'express'
import { authorizeRoles } from '@/middleware/authorizeRoles'
import { verifyToken } from '@/middleware/verifyToken'
import { uploadMiddleware } from '@/middleware/uploadMiddleware'
import { applyLoan, getMyApplication, getSalarySlip, savePersonalDetails, uploadSalarySlip } from '@/controllers/borrowerController'

export const borrowerRoutes = Router()

borrowerRoutes.use(verifyToken)
borrowerRoutes.use(authorizeRoles('borrower'))

borrowerRoutes.post('/personal-details', savePersonalDetails)
borrowerRoutes.post('/upload-salary-slip', uploadMiddleware, uploadSalarySlip)
borrowerRoutes.get('/salary-slip', getSalarySlip)
borrowerRoutes.post('/apply', applyLoan)
borrowerRoutes.get('/me', getMyApplication)
