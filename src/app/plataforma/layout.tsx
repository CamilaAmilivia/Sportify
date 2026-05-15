import NavbarPlataforma from "./NavbarPlataforma";
import { ContenidoPlataforma } from "../../components/ContenidoPlataforma";
import { requerirUsuarioActual } from "@/lib/sesion";

export default async function LayoutPlataforma({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await requerirUsuarioActual();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <NavbarPlataforma usuario={usuario} />

      <ContenidoPlataforma>{children}</ContenidoPlataforma>
    </div>
  );
}