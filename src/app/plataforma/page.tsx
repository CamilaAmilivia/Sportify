import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NavbarPlataforma from "./NavbarPlataforma";

export const metadata = {
  title: "Plataforma — Sportify",
  description: "Área exclusiva para clientes de Sportify.",
};

export default async function PaginaPlataforma() {
  const cookieStore = await cookies();
  const email = cookieStore.get("sportify_session")?.value;

  if (!email) {
    redirect("/login");
  }

  // Buscar el usuario en la base de datos
  const cliente = await prisma.cliente.findUnique({
    where: { email },
    select: {
      nombre: true,
      apellido: true,
      email: true,
    },
  });

  if (!cliente) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-white)" }}>
      <NavbarPlataforma usuario={cliente} />

      {/* Pantalla en blanco lista para ser construida de a poco */}
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        {/* Contenedor inicial de bienvenida suave */}
        <div style={{ opacity: 0.8 }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--color-dark)",
              marginBottom: 8,
            }}
          >
            ¡Hola, {cliente.nombre}! 👋
          </h1>
          <p style={{ color: "var(--color-gray)", fontSize: "1rem" }}>
            Bienvenido a tu plataforma. Muy pronto vas a poder gestionar tus turnos y rutinas desde acá.
          </p>
        </div>
      </main>
    </div>
  );
}
