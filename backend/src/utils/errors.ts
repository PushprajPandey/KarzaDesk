export class ApiError extends Error {
  public readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

export const isApiError = (value: unknown): value is ApiError => {
  return value instanceof ApiError && typeof value.statusCode === 'number'
}
