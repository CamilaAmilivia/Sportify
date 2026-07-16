import { requerirUsuarioActual } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { prisma } from "@/lib/prisma";
import FormularioCambioEmail from "./FormularioCambioEmail";

export const metadata = {
  title: "Mi Perfil — Sportify",
};

export default async function PaginaPerfil() {
  const sesion = await requerirUsuarioActual();

  const usuario = await prisma.usuario.findUnique({
    where: { email: sesion.email },
  });

  if (!usuario) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <>
      <TituloPagina
        titulo="Mi perfil"
        descripcion="Administra tu información personal y configuración de cuenta."
      />

      <div className="max-w-3xl bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {(usuario.rol === 'PROFESOR' || usuario.rol === 'ADMIN') && (
          <div className="bg-green-500 text-white px-8 py-3 font-bold text-center uppercase tracking-wide">
            {usuario.rol}
          </div>
        )}
        <div style={{ padding: '32px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">Nombre</label>
              <p className="text-gray-900 font-medium text-lg">{usuario.nombre}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">Apellido</label>
              <p className="text-gray-900 font-medium text-lg">{usuario.apellido}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">DNI</label>
              <p className="text-gray-900 font-medium text-lg">{usuario.dni}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">Correo electrónico</label>
              <p className="text-gray-900 font-medium text-lg">{usuario.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">Fecha de nacimiento</label>
              <p className="text-gray-900 font-medium text-lg">
                {usuario.fechaNac ? new Date(usuario.fechaNac).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "No especificada"}
              </p>
            </div>
          </div>

          {/* Formulario para cambiar el correo electrónico */}
          <FormularioCambioEmail />
        </div>
      </div>
    </>
  );
}
