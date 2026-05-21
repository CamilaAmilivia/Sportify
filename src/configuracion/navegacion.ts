import type { RolUsuario } from "@/tipos/usuario";

export type ItemNavegacion = {
    nombre: string;
    href: string;
    icono: string;
};

export const navegacionPorRol: Record<RolUsuario, ItemNavegacion[]> = {
    ADMIN: [
        { nombre: "Dashboard", href: "/plataforma", icono: "⌁" },
        { nombre: "Clases", href: "/plataforma/clases", icono: "▣" },
        { nombre: "Profesores", href: "/plataforma/profesores", icono: "👥" },
        { nombre: "Usuarios", href: "/plataforma/usuarios", icono: "👤" },
        { nombre: "Asistencia", href: "/plataforma/asistencia", icono: "▤" },
    ],

    CLIENTE: [
        { nombre: "Cronograma", href: "/plataforma/cronograma", icono: "▣" },
        { nombre: "Mis Clases", href: "/plataforma/mis-clases", icono: "▤" },
    ],

    PROFESOR: [
        { nombre: "Mis Clases", href: "/plataforma/mis-clases", icono: "▤" },
        { nombre: "Asistencia", href: "/plataforma/asistencia", icono: "▣" },
    ],
};

export const nombreRol: Record<RolUsuario, string> = {
    ADMIN: "Administrador",
    CLIENTE: "Cliente",
    PROFESOR: "Profesor",
};