/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // AVIF first, WebP fallback — doctor portraits are the platform's heaviest asset.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // YouTube poster frames for the facade pattern on doctor profiles.
      // Note: this is an image request only. The YouTube player itself is never
      // loaded until the patient clicks play AND has given media consent (DPDP).
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Do not leak the current URL to third parties. Matters on a hospital site
          // where a path can reveal the condition someone was reading about.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        // Phase 6+: authenticated routes must never be cached anywhere.
        // Declared now so the rule exists before the first patient record does.
        source: '/portal/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

export default nextConfig
