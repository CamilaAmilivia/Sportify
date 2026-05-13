import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormularioLogin from "./FormularioLogin";

export const metadata = {
  title: "Iniciar sesión — Sportify",
  description: "Ingresá a tu cuenta de Sportify para gestionar tus entrenamientos y actividades.",
};

export default async function PaginaLogin() {
  const cookieStore = await cookies();
  if (cookieStore.has("sportify_session")) {
    redirect("/plataforma");
  }

  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "calc(100vh - 68px)",
          background: "var(--color-gray-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
          }}
        >
          {/* Card */}
          <div
            style={{
              background: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-card)",
              padding: "40px 40px",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--color-dark)",
                  marginBottom: 6,
                }}
              >
                Iniciar sesión
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--color-gray)" }}>
                Ingresá tus credenciales para acceder a tu cuenta.
              </p>
            </div>

            <FormularioLogin />

            {/* Footer del card */}
            <p
              style={{
                textAlign: "center",
                fontSize: "0.85rem",
                color: "var(--color-gray)",
                marginTop: 24,
              }}
            >
              ¿No tenés cuenta?{" "}
              <Link
                href="/registro"
                style={{
                  color: "var(--color-green)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Registrate acá
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
