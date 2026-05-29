import { requerirRol } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { GestionClases } from "@/components/admin/GestionClases";

export const metadata = {
  title: "Clases — Sportify",
};

export default async function PaginaClases() {
  await requerirRol(["ADMIN"]);

  const disciplinas = await prisma.disciplina.findMany({
    select: { id: true, nombre: true },
    where: { activa: true },
  });
  const profesores = await prisma.usuario.findMany({
  where: {
    rol: "PROFESOR",
  },
  select: {
    id: true,
    nombre: true,
    apellido: true,
    dni: true,
  },
});

  return (
  <GestionClases
    disciplinas={disciplinas}
    profesores={profesores}
  />
);
}