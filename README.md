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