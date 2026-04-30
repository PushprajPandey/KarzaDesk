const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8080',
        pathname: '/uploads/**'
      }
    ]
  }
}

module.exports = nextConfig
