/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: [
      'huanyu.ink',
      '*.huanyu.ink',
      "https://huanyu.ink",
      "http://huanyu.ink",
      "https://www.huanyu.ink",
      "http://www.huanyu.ink",
      "https://*.huanyu.ink",
      "http://*.huanyu.ink",
    ],
  },
}

export default nextConfig
