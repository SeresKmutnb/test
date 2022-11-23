/** @type {import('next').NextConfig} */

// module.exports = {
//   reactStrictMode: false,
//   webpack5: true,
//   webpack:(config) => {
//     config.resolve.fallback = { fs: false, net: false, dns: false, tls: false };
//     return config
//   }
// }
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
