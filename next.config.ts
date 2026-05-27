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

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: getLocalIPs(),
};

export default nextConfig;
