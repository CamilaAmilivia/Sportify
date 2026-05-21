# Sportify

Sistema de gestión de reservas e información para el gimnasio Sportify.

## Stack

- React
- Next.js
- TypeScript
- Prisma
- SQLite
- Tailwind CSS

## Setup inicial

**1. Instalar dependencias**

```bash
npm install
```

**2. Crear el archivo de entorno**

Crear un archivo `.env` y definir la ruta de la base de datos:

```env
DATABASE_URL="file:./dev.db"
```

**2.1 Instalar Prisma**

```bash
npx prisma generate
```

**3. Crear la base de datos y generar el cliente Prisma**

Para crear el archivo `dev.db`, aplicar las migraciones y generar el cliente Prisma automáticamente:

```bash
npx prisma migrate dev
```

## Ejecución local

Correr el servidor de desarrollo:

```bash
npm run dev
```

Se despliega en [http://localhost:3000](http://localhost:3000).

## Utilidades

**Visualización de la base de datos con Prisma Studio:**

```bash
npx prisma studio
```

**Cargar los seeds de la base de datos:**

```bash
npx prisma db seed
```

## Gestión de roles

Los siguientes son ejemplos de cómo requerir que un usuario tenga cierto rol para ver componentes o páginas.

### Para administrador

```tsx
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
```
*Nota: Si entra un cliente que no tiene permisos, lo redirecciona a `/plataforma`.*

### Para cliente

```tsx
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
```

### Para múltiples roles (ej. admin y profesor)

```tsx
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
```