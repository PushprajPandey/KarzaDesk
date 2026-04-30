import { round2 } from '@/utils/numbers'

export type LoanCalculation = {
  principal: number
  tenureDays: number
  interestRate: 12
  simpleInterest: number
  totalRepayment: number
  outstandingBalance: number
}

export const calculateLoan = (principal: number, tenureDays: number): LoanCalculation => {
  const p = round2(principal)
  const t = round2(tenureDays)
  const interestRate: 12 = 12

  const siRaw = (p * interestRate * t) / (365 * 100)
  const simpleInterest = round2(siRaw)
  const totalRepayment = round2(p + simpleInterest)
  const outstandingBalance = round2(totalRepayment)

  return {
    principal: p,
    tenureDays: Math.round(t),
    interestRate,
    simpleInterest,
    totalRepayment,
    outstandingBalance
  }
}
