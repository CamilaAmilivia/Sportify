# Sportify

Sistema de gestión de reservas e información para el gimnasio Sportify.

## Stack

- React
- Next.js
- TypeScript
- Prisma
- SQLite
- Tailwind

## Setup inicial

**1. Instalar dependencias**

```bash
npm install
```

**2. Crear el archivo de entorno**

Crear un archivo `.env` y definimos la ruta de la base de datos:

```env
DATABASE_URL="file:./dev.db"
```

**3. Crear la base de datos y generar el cliente Prisma**

Para crear el archivo `dev.db`, aplicar las migraciones y generar el cliente Prisma automáticamente:

```bash
npx prisma migrate dev
```

## Ejecución local

Correr servidor de desarrollo:

```bash
npm run dev
```

Se despliega en [http://localhost:3000](http://localhost:3000).

## Utilidades

Visualización de la base de datos con Prisma Studio:

```bash
npx prisma studio
```
Cargar los seeds de la base de datos

npx prisma db seed



--------------------------------------------------------------------------------------------------------
**3. Roles, formas para hacer q compoenentes/paginas q creemos vean el ROL**

para Admin
import { requerirRol } from "@/lib/sesion";

export default async function PaginaUsuarios() {
  const usuario = await requerirRol(["ADMIN"]);

  return (
    <main>
      <h1>Gestión de Usuarios</h1>
      <p>Usuario logueado: {usuario.email}</p>
    </main>
  );
}

Con eso, si entra un cliente, lo manda a: /Plataforma


Para Cliente
import { requerirRol } from "@/lib/sesion";

export default async function PaginaMisClases() {
  const usuario = await requerirRol(["CLIENTE"]);

  return (
    <main>
      <h1>Mis Clases</h1>
      <p>Cliente: {usuario.nombre}</p>
    </main>
  );
}

Para AMBOS
import { requerirRol } from "@/lib/sesion";

export default async function PaginaAsistencia() {
  const usuario = await requerirRol(["ADMIN", "PROFESOR"]);

  return (
    <main>
      <h1>Asistencia</h1>
      <p>Rol actual: {usuario.rol}</p>
    </main>
  );
}