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

# Base de datos
DATABASE_URL="file:./dev.db"

# Clave secreta para JWT
JWT_SECRET="super-secret-key-for-sportify-app"

# Dominio de ngrok 
NGROK_HOST="<tu-subdominio>.ngrok-free.app"

# URL pública de la aplicación (necesaria para los webhooks de MercadoPago)
APP_URL="https://<tu-subdominio>.ngrok-free.app"

# Credenciales de MercadoPago
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."

# Configuración SMTP para envío de correos
SMTP_HOST="servidor-smtp.com"
SMTP_PORT="587"
SMTP_USER="usuario-smtp"
SMTP_PASS="contraseña-smtp"
SMTP_FROM="no-reply@sportify.com"

# URL base para los enlaces en correos enviados
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
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

## Datos de prueba

### Sprint 1

```bash
npx prisma db seed
```

### Sprint 2

```bash
npm run seed:sprint2
```