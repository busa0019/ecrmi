/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ typedRoutes is now stable (not experimental)
  typedRoutes: true,

  // ✅ Allow LAN / network access during development
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.2.19:3000",
  ],
};

module.exports = nextConfig;