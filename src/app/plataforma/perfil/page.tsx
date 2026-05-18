import { requerirUsuarioActual } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { prisma } from "@/lib/prisma";

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
        titulo="Mi Perfil"
        descripcion="Administra tu información personal y configuración de cuenta."
      />

      <div className="max-w-3xl bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div style={{ padding: '32px' }}>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p className="text-gray-500 capitalize">{usuario.rol.toLowerCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">Documento (DNI)</label>
              <p className="text-gray-900 font-medium text-lg">{usuario.dni}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">Correo Electrónico</label>
              <p className="text-gray-900 font-medium text-lg">{usuario.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">Fecha de Nacimiento</label>
              <p className="text-gray-900 font-medium text-lg">
                {usuario.fechaNac ? new Date(usuario.fechaNac).toLocaleDateString("es-AR") : "No especificada"}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-500">Estado de Cuenta</label>
              <p className="text-gray-900 font-medium text-lg">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {usuario.activo ? "Activo" : "Inactivo"}
                </span>
              </p>
            </div>
          </div>

          {/* Aquí irá el desarrollo futuro para cambiar correo o editar datos */}
        </div>
      </div>
    </>
  );
}
