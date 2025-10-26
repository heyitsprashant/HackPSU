/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/interview-coach", destination: "/dashboard/interview-assistant", statusCode: 301 },
      { source: "/dashboard/interview-coach", destination: "/dashboard/interview-assistant", statusCode: 301 },
      { source: "/interviews", destination: "/mock-interviews", statusCode: 301 },
    ]
  },
}

export default nextConfig
