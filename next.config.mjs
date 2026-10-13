/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Kein ESLint im Projekt nötig – verhindert, dass der Vercel-Build daran scheitert.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
