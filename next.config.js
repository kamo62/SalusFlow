/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['salusflow.mashdev.co.za'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self' https://salusflow.mashdev.co.za;
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self' data:;
              connect-src 'self' https://salusflow.mashdev.co.za ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://*.supabase.co https://*.supabase.in;
              frame-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL};
            `.replace(/\s+/g, ' ').trim()
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig 