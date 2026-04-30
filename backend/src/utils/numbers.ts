export const round2 = (value: number): number => {
  const safe = Number(value)
  if (!Number.isFinite(safe)) {
    return 0
  }
  return Math.round((safe + Number.EPSILON) * 100) / 100
}
