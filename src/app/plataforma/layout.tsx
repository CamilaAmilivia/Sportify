import NavbarPlataforma from "./NavbarPlataforma";
import { ContenidoPlataforma } from "../../components/ContenidoPlataforma";
import { requerirUsuarioActual } from "@/lib/sesion";
import { obtenerNotificacionCupoLiberado } from "@/lib/notificaciones";

export default async function LayoutPlataforma({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await requerirUsuarioActual();

  const notificacionCupoLiberado =
    usuario.rol === "CLIENTE"
      ? await obtenerNotificacionCupoLiberado(usuario.id)
      : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <NavbarPlataforma
        usuario={usuario}
        notificacionCupoLiberado={notificacionCupoLiberado}
      />

      <ContenidoPlataforma>{children}</ContenidoPlataforma>
    </div>
  );
}