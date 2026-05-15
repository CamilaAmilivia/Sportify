export type RolUsuario = "ADMIN" | "CLIENTE" | "PROFESOR";

export type UsuarioSesion = {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: RolUsuario;
};