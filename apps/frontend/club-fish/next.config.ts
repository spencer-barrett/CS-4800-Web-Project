import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.blob.core.windows.net' },
    ],
  },

  
};
module.exports = {  
// async redirects() {
//     return [
//       {
//         source: '/play',
//         destination: '/login',
//         permanent: true,
//       },
//     ]
//   }
};

export default nextConfig;
