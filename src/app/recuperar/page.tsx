import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormularioRecuperar from "./FormularioRecuperar";

export const metadata = {
  title: "Recuperar cuenta — Sportify",
  description: "Recupera el acceso a tu cuenta de Sportify.",
};

export default function PaginaRecuperar() {
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
                Recuperar cuenta
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--color-gray)" }}>
                Ingresá tu dirección de correo electrónico para iniciar con la recuperación de tu cuenta.
              </p>
            </div>

            <FormularioRecuperar />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
