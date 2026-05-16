import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { RolUsuario, UsuarioSesion } from "@/tipos/usuario";

export async function obtenerUsuarioActual(): Promise<UsuarioSesion | null> {
    const cookieStore = await cookies();
    const email = cookieStore.get("sportify_session")?.value;

    if (!email) {
        return null;
    }

    const usuario = await prisma.usuario.findUnique({
        where: { email },
        select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
        },
    });

    if (!usuario) {
        return null;
    }

    return usuario as UsuarioSesion;
}

export async function requerirUsuarioActual(): Promise<UsuarioSesion> {
    const usuario = await obtenerUsuarioActual();   
    if (!usuario) {
        redirect("/login");
    }   
    return usuario;
}

export async function requerirRol( rolesPermitidos: RolUsuario[]): Promise<UsuarioSesion> {
    const usuario = await requerirUsuarioActual();

    if (!rolesPermitidos.includes(usuario.rol)) {
        redirect("/plataforma");
    }

    return usuario;
}

export async function obtenerRolActual(): Promise<RolUsuario | null> {
    const usuario = await obtenerUsuarioActual();   
    return usuario?.rol ?? null;
}