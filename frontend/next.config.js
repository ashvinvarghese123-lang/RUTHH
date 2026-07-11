/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // In production, the browser only ever talks to this Vercel domain.
  // Requests to /api/v1/* are silently forwarded server-side to the Render
  // backend (set via the BACKEND_URL env var, configured in Vercel only —
  // not needed locally). This makes the session cookie first-party from
  // the browser's point of view, avoiding third-party cookie blocking
  // that breaks cross-domain login sessions.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
