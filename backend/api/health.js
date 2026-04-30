// Simple health endpoint for Vercel: /api/health
// This file does NOT depend on Express, MongoDB, or dist build output.

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(
    JSON.stringify({
      ok: true,
      service: 'karzadesk-backend',
      route: '/api/health',
      timestamp: new Date().toISOString()
    })
  )
}
