/** @type {import('next').NextConfig} */
const feedNoStore = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
      },
      {
        protocol: "https",
        hostname: "img.sofascore.com",
      },
      {
        protocol: "https",
        hostname: "api.sofascore.com",
      },
    ],
  },
  async headers() {
    return [
      { source: "/api/fixtures", headers: feedNoStore },
      { source: "/api/fixtures/:path*", headers: feedNoStore },
      { source: "/api/matches/live", headers: feedNoStore },
      { source: "/api/matches/live/:path*", headers: feedNoStore },
    ];
  },
};

export default nextConfig;
