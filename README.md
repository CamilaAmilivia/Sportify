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

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# Dominio de ngrok para allowedDevOrigins en next.config.ts
NGROK_HOST="<tu-subdominio>.ngrok-free.app"

# URL pública de la aplicación (necesaria para los webhooks de MercadoPago)
APP_URL="https://<tu-subdominio>.ngrok-free.app"

# Credenciales de MercadoPago
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."
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

## MercadoPago y ngrok

La API de MercadoPago requiere una URL pública para enviar notificaciones (webhooks). En desarrollo
local se puede usar **ngrok** para exponer el servidor:

**1. Iniciar el túnel con ngrok:**

```bash
ngrok http 3000
```

Ngrok asignará un subdominio aleatorio del tipo `<subdominio>.ngrok-free.app`.

**2. Actualizar el `.env`** con ese dominio:

```env
APP_URL="https://<subdominio>.ngrok-free.app"
NGROK_HOST="<subdominio>.ngrok-free.app"
```

**3. Reiniciar el servidor de desarrollo** para que `next.config.ts` tome el nuevo `NGROK_HOST`
y permita las peticiones de Hot Module Replacement desde ese origen:

```bash
npm run dev
```

> **Nota:** El subdominio de ngrok cambia en cada sesión (salvo que tengas un plan de pago).
> Hay que repetir los pasos 1–3 cada vez que se reinicie ngrok.

## Utilidades

**Visualización de la base de datos con Prisma Studio:**

```bash
npx prisma studio
```

**Cargar los seeds de la base de datos:**

```bash
npx prisma db seed
```

**Prueba de asistencia con QR:**

Crear una clase de prueba para el profesor por defecto (profesor@sportify.com):

```bash
npm run test:qr
```

Este comando:
1. Limpia cualquier clase de prueba anterior.
2. Crea una "Clase de Prueba QR" programada exactamente para el minuto actual.
3. Inscribe automáticamente a todos los usuarios con rol `CLIENTE` en esta clase.

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