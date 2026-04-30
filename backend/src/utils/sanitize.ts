export const sanitizeFilename = (name: string): string => {
  const base = typeof name === 'string' ? name : 'file'
  return base
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 180)
}
