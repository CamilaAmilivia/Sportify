import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sportify — Gimnasio",
  description:
    "Sportify: tu gimnasio de Yoga, Pilates y Funcional. Reservá tus clases online.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
