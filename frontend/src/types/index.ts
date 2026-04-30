export type UserRole = 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower'

export type ApplicationStatus = 'incomplete' | 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed'

export type LoanStatus = 'sanctioned' | 'disbursed' | 'closed'

export type EmploymentMode = 'salaried' | 'self-employed' | 'unemployed'

export type User = {
  _id: string
  fullName: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type Application = {
  _id: string
  userId: string | User
  fullName: string
  pan: string
  dateOfBirth: string
  monthlySalary: number
  employmentMode: EmploymentMode
  salarySlipUrl: string
  salarySlipOriginalName: string
  status: ApplicationStatus
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export type Loan = {
  _id: string
  applicationId: string | Application
  userId: string | User
  principal: number
  tenureDays: number
  interestRate: number
  simpleInterest: number
  totalRepayment: number
  amountPaid: number
  outstandingBalance: number
  status: LoanStatus
  disbursedAt?: string
  closedAt?: string
  remainingBalance?: number
  createdAt: string
  updatedAt: string
}

export type Payment = {
  _id: string
  loanId: string | Loan
  recordedBy: string | User
  utrNumber: string
  amount: number
  paymentDate: string
  createdAt: string
  updatedAt: string
}

export type BREError = { message: string }

export type LoanCalculation = {
  principal: number
  tenureDays: number
  interestRate: 12
  simpleInterest: number
  totalRepayment: number
  outstandingBalance: number
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string }

export type PersonalDetailsInput = {
  fullName: string
  pan: string
  dateOfBirth: string
  monthlySalary: number
  employmentMode: EmploymentMode
}

export type LoanConfigInput = {
  principal: number
  tenureDays: number
}

export type PaymentInput = {
  utrNumber: string
  amount: number
  paymentDate: string
}
