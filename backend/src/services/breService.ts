export type BREInput = {
  dateOfBirth: string
  monthlySalary: number
  pan: string
  employmentMode: string
}

export type BREResult = {
  passed: boolean
  errors: string[]
}

const yearsBetween = (from: Date, to: Date): number => {
  const y = to.getUTCFullYear() - from.getUTCFullYear()
  const m = to.getUTCMonth() - from.getUTCMonth()
  if (m < 0) {
    return y - 1
  }
  if (m > 0) {
    return y
  }
  const d = to.getUTCDate() - from.getUTCDate()
  return d >= 0 ? y : y - 1
}

export const runBRE = (data: BREInput): BREResult => {
  const errors: string[] = []

  const dob = new Date(data.dateOfBirth)
  if (Number.isNaN(dob.getTime())) {
    errors.push('Age must be between 23 and 50 years')
  } else {
    const age = yearsBetween(dob, new Date())
    if (age < 23 || age > 50) {
      errors.push('Age must be between 23 and 50 years')
    }
  }

  const salary = Number(data.monthlySalary)
  if (!Number.isFinite(salary) || salary < 25000) {
    errors.push('Monthly salary must be at least ₹25,000')
  }

  const pan = String(data.pan ?? '').trim().toUpperCase()
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    errors.push('Invalid PAN format')
  }

  if (String(data.employmentMode) === 'unemployed') {
    errors.push('Unemployed applicants are not eligible')
  }

  return { passed: errors.length === 0, errors }
}
