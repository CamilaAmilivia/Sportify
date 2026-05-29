import type { NextConfig } from "next";
import os from "os";

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

// Dominio público asignado por ngrok — definir NGROK_HOST en .env
const NGROK_HOST = process.env.NGROK_HOST;

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
  allowedDevOrigins: [...getLocalIPs(), NGROK_HOST],
};

export default nextConfig;
