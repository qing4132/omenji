import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出 — 输出到 out/，可直接部署到 Cloudflare Pages / 任何静态托管
  output: 'export',
  // 允许局域网 IP 访问 dev server（手机调试用）
  // Next 16 要求显式声明非 localhost 的 dev 来源，否则资源会全部走 localhost
  // 导致手机能加载 HTML 但 hydrate 不上 → 交互全废
  allowedDevOrigins: ['192.168.2.219', '192.168.*.*', '10.*.*.*'],
};

export default nextConfig;
