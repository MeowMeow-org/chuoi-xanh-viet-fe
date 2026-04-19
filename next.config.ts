import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build ra bundle standalone để Docker image chỉ cần node + .next/standalone,
  // giảm kích thước container xuống ~100MB thay vì mang cả node_modules.
  output: "standalone",
};

export default nextConfig;
