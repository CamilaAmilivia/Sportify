import type { RolUsuario } from "@/tipos/usuario";

export type ItemNavegacion = {
    nombre: string;
    href: string;
    icono: string;
};

export const navegacionPorRol: Record<RolUsuario, ItemNavegacion[]> = {
    ADMIN: [
        { nombre: "Cronograma", href: "/plataforma/cronograma", icono: "▣" },
        { nombre: "Clases", href: "/plataforma/clases", icono: "▣" },
        { nombre: "Profesores", href: "/plataforma/profesores", icono: "👥" },
    ],

    CLIENTE: [
        { nombre: "Cronograma", href: "/plataforma/cronograma", icono: "▣" },
        { nombre: "Mis clases", href: "/plataforma/mis-clases", icono: "▤" },
    ],

    PROFESOR: [
        { nombre: "Cronograma", href: "/plataforma/cronograma", icono: "▣" },
        { nombre: "Mis clases", href: "/plataforma/mis-clases", icono: "▤" },
    ],
};

export const nombreRol: Record<RolUsuario, string> = {
    ADMIN: "Administrador",
    CLIENTE: "Cliente",
    PROFESOR: "Profesor",
};