# Estructura del proyecto Sportify

Este archivo explica cómo organizar el proyecto para que todos los integrantes sepan dónde crear componentes, lógica, helpers, datos mockeados y páginas.

> Regla general: lo nuevo que creemos para Sportify debe estar en español cuando sea posible. Si algo pertenece a Next.js, React, Prisma o una librería externa, se mantiene como viene.

-------------------------------------------------------------------------------------------------


## Stack actual

- Next.js
- React
- TypeScript
- Prisma
- SQLite
- Tailwind / estilos propios existentes

---

## Estructura recomendada

-------------------------------------------------------------------------------------------------
src/
  app/
    login/
    registro/
    plataforma/
      page.tsx
      NavbarPlataforma.tsx
      actions.ts
      clases/
        page.tsx
      profesores/
        page.tsx
      usuarios/
        page.tsx
      asistencia/
        page.tsx
      cronograma/
        page.tsx
      mis-clases/
        page.tsx

  componentes/
    layout/
      ContenedorPlataforma.tsx
      BarraNavegacion.tsx
      MenuCuenta.tsx

    ui/
      TarjetaEstadistica.tsx
      TarjetaAccion.tsx
      TituloPagina.tsx
      Etiqueta.tsx
      TablaBase.tsx
      BotonPrincipal.tsx

    admin/
      PanelAdmin.tsx
      GestionClases.tsx
      GestionProfesores.tsx
      GestionUsuarios.tsx
      GestionAsistencia.tsx

    cliente/
      PanelCliente.tsx
      CronogramaCliente.tsx
      MisClasesCliente.tsx

    profesor/
      PanelProfesor.tsx
      ClasesProfesor.tsx
      AsistenciaProfesor.tsx

  configuracion/
    navegacion.ts

  datos/
    datosAdminMock.ts
    datosClienteMock.ts
    datosProfesorMock.ts

  lib/
    prisma.ts
    sesion.ts

  tipos/
    usuario.ts
    navegacion.ts
```

---

## ¿Qué va en cada carpeta?

### `src/app`

Acá van las rutas de Next.js.

Cada carpeta representa una URL.

Ejemplos:


src/app/plataforma/page.tsx


representa:


/plataforma


y:


src/app/plataforma/clases/page.tsx

representa:


/plataforma/clases



En esta carpeta deberían quedar principalmente páginas, acciones del servidor y archivos específicos de cada ruta.


-------------------------------------------------------------------------------------------------

-> `src/componentes`

Acá van componentes reutilizables.

La idea es evitar repetir código visual en varias páginas.

-------------------------------------------------------------------------------------------------

### `src/componentes/layout`

Componentes de estructura general.

Ejemplos:

- Navbar de plataforma.
- Menú de cuenta.
- Layout principal con fondo, ancho máximo y contenido.
- Contenedor común para las páginas internas.

Estos componentes no deberían tener lógica de negocio fuerte. Su trabajo principal es ordenar la pantalla.

-------------------------------------------------------------------------------------------------

`src/componentes/ui`

Componentes visuales genéricos.

Ejemplos:

- Tarjetas de estadísticas.
- Botones.
- Títulos.
- Etiquetas de estado.
- Tablas genéricas.
- Inputs reutilizables.

Estos componentes deberían poder usarse tanto en admin, cliente o profesor.

-------------------------------------------------------------------------------------------------

`src/componentes/admin`

Componentes específicos del rol administrador.

Ejemplos:

- Panel de administración.
- Gestión de clases.
- Gestión de profesores.
- Gestión de usuarios.
- Gestión de asistencia.

-------------------------------------------------------------------------------------------------

 `src/componentes/cliente`

Componentes específicos del rol cliente.

Ejemplos:

- Panel del cliente.
- Cronograma.
- Mis clases.
- Perfil del cliente.

-------------------------------------------------------------------------------------------------

 `src/componentes/profesor`

Componentes específicos del rol profesor.

Ejemplos:

- Panel del profesor.
- Lista de clases asignadas.
- Toma de asistencia.

-------------------------------------------------------------------------------------------------

### `src/configuracion`

Acá van configuraciones estáticas del sistema.

Ejemplo recomendado:

```txt
src/configuracion/navegacion.ts
```

Ese archivo puede definir qué opciones ve cada rol en la navbar.

Ejemplo:

```ts
export const navegacionPorRol = {
  ADMIN: [
    { nombre: "Dashboard", href: "/plataforma" },
    { nombre: "Clases", href: "/plataforma/clases" },
    { nombre: "Profesores", href: "/plataforma/profesores" },
    { nombre: "Usuarios", href: "/plataforma/usuarios" },
    { nombre: "Asistencia", href: "/plataforma/asistencia" },
  ],
  CLIENTE: [
    { nombre: "Dashboard", href: "/plataforma" },
    { nombre: "Cronograma", href: "/plataforma/cronograma" },
    { nombre: "Mis Clases", href: "/plataforma/mis-clases" },
  ],
  PROFESOR: [
    { nombre: "Dashboard", href: "/plataforma" },
    { nombre: "Mis Clases", href: "/plataforma/mis-clases-profesor" },
    { nombre: "Asistencia", href: "/plataforma/asistencia" },
  ],
};
```

---

### `src/datos`

Acá van datos mockeados temporales.

Sirven para construir pantallas antes de tener toda la lógica real conectada a la base de datos.

Ejemplos:

```txt
datosAdminMock.ts
datosClienteMock.ts
datosProfesorMock.ts
```

Cuando ya exista la consulta real con Prisma, estos datos se reemplazan.

---

### `src/lib`

Acá va lógica compartida que no es componente visual.

Ejemplos:

- Conexión de Prisma.
- Helpers de sesión.
- Funciones reutilizables.
- Validaciones compartidas.
- Utilidades generales.

---

### `src/tipos`

Acá van tipos TypeScript reutilizables.

Ejemplos:

```ts
export type RolUsuario = "ADMIN" | "CLIENTE" | "PROFESOR";

export type UsuarioSesion = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
};
```

---

## Archivo actual: `NavbarPlataforma.tsx`

Este archivo es un componente de cliente porque usa estado de React:

```ts
"use client";
```

Actualmente se encarga de:

1. Mostrar el logo de Sportify.
2. Mostrar opciones de navegación según el rol del usuario.
3. Marcar como activa la ruta actual usando `usePathname`.
4. Mostrar el botón `Mi Cuenta`.
5. Mostrar el menú desplegable con email, rol y acciones.
6. Llamar a `cerrarSesion` cuando el usuario quiere salir.

El archivo recibe el usuario por props:

```ts
<NavbarPlataforma usuario={usuario} />
```

Por eso no consulta directamente la base de datos.

La consulta del usuario logueado se hace en `page.tsx`, que es un Server Component.

---

## ¿Cómo saber qué rol está logueado?

La mejor opción es crear un helper en:

```txt
src/lib/sesion.ts
```

Así evitamos repetir en todas las páginas esto:

```ts
const cookieStore = await cookies();
const email = cookieStore.get("sportify_session")?.value;

const usuario = await prisma.usuario.findUnique({
  where: { email },
});
```

---

## Helper recomendado: `src/lib/sesion.ts`

```ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type RolUsuario = "ADMIN" | "CLIENTE" | "PROFESOR";

export async function obtenerUsuarioActual() {
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

  return usuario;
}

export async function requerirUsuarioActual() {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    redirect("/login");
  }

  return usuario;
}

export async function requerirRol(rolesPermitidos: RolUsuario[]) {
  const usuario = await requerirUsuarioActual();

  if (!rolesPermitidos.includes(usuario.rol as RolUsuario)) {
    redirect("/plataforma");
  }

  return usuario;
}

export async function obtenerRolActual() {
  const usuario = await obtenerUsuarioActual();

  return usuario?.rol ?? null;
}
```

---

## Cómo usar el helper en una página

Ejemplo para una página general de plataforma:

```tsx
import NavbarPlataforma from "./NavbarPlataforma";
import { requerirUsuarioActual } from "@/lib/sesion";

export default async function PaginaPlataforma() {
  const usuario = await requerirUsuarioActual();

  return (
    <div>
      <NavbarPlataforma usuario={usuario} />

      <main>
        {usuario.rol === "ADMIN" && <p>Panel admin</p>}
        {usuario.rol === "CLIENTE" && <p>Panel cliente</p>}
        {usuario.rol === "PROFESOR" && <p>Panel profesor</p>}
      </main>
    </div>
  );
}
```

Ejemplo para una página solo de administradores:

```tsx
import { requerirRol } from "@/lib/sesion";

export default async function PaginaGestionUsuarios() {
  const usuario = await requerirRol(["ADMIN"]);

  return (
    <main>
      <h1>Gestión de usuarios</h1>
      <p>Usuario logueado: {usuario.email}</p>
    </main>
  );
}
```

---

## ¿Conviene helper o dejarlo como está?

Conviene crear el helper.

Motivos:

1. Evita repetir código en cada página.
2. Centraliza cómo se obtiene el usuario logueado.
3. Permite validar roles de forma clara.
4. Si más adelante cambia la sesión, se modifica un solo archivo.
5. Hace más fácil que otros compañeros sepan qué llamar.

Regla recomendada:

- Si una página necesita saber quién está logueado, usar `requerirUsuarioActual`.
- Si una página es solo para ciertos roles, usar `requerirRol`.
- Si solo se necesita consultar el rol sin redireccionar, usar `obtenerRolActual`.

---

## Importante sobre componentes cliente

Los componentes con `"use client"` no deberían consultar Prisma directamente.

Por ejemplo, `NavbarPlataforma.tsx` no debería llamar a Prisma.

Lo correcto es:

1. La página del servidor obtiene el usuario.
2. La página le pasa el usuario a la navbar por props.
3. La navbar solo renderiza datos y maneja interacciones visuales.

---

## Entidades base de la base de datos

Actualmente la arquitectura base contempla estas entidades:

- Usuario
- Disciplina
- Clase
- Inscripcion
- ListaEspera
- Asistencia
- Pago

Por ahora `Usuario` representa clientes, profesores y administradores mediante el campo `rol`.

Ejemplo:

```txt
Usuario con rol ADMIN
Usuario con rol CLIENTE
Usuario con rol PROFESOR
```

Esto evita tener tablas separadas para cada tipo de usuario al inicio del proyecto.

---

## Convenciones del proyecto

### Nombres visibles

Usar español:

```txt
Panel de Administración
Gestionar Clases
Mis Clases
Cronograma
Asistencia
```

### Rutas

Usar español cuando sea posible:

```txt
/plataforma/clases
/plataforma/profesores
/plataforma/usuarios
/plataforma/asistencia
/plataforma/cronograma
/plataforma/mis-clases
```

### Componentes nuevos

Usar español cuando sea posible:

```txt
TarjetaEstadistica
TarjetaAccion
PanelAdmin
PanelCliente
MenuCuenta
BarraNavegacion
```

### Variables nuevas

Usar español cuando sea posible:

```ts
const usuarioActual = ...
const rolActual = ...
const menuAbierto = ...
const itemsNavegacion = ...
```

---

## Próximos pasos recomendados

1. Crear `src/lib/sesion.ts`.
2. Mover la configuración de navegación a `src/configuracion/navegacion.ts`.
3. Separar componentes genéricos de UI.
4. Crear los paneles iniciales de admin y cliente con datos mockeados.
5. Crear páginas internas de plataforma de a una.
