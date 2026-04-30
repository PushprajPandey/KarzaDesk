export type UserRole = 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower'

export type ApplicationStatus = 'incomplete' | 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed'

export type EmploymentMode = 'salaried' | 'self-employed' | 'unemployed'

export type LoanStatus = 'sanctioned' | 'disbursed' | 'closed'

export type ApiSuccess<T> = { success: true; data: T }
export type ApiFail = { success: false; message: string }

export type IUserSafe = {
  _id: string
  fullName: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}
