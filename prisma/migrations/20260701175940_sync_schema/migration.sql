-- AlterTable
ALTER TABLE "ListaEspera" ADD COLUMN "notificadoEn" DATETIME;

-- CreateTable
CREATE TABLE "CreditoClase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "motivo" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usadoEn" DATETIME,
    "usuarioId" INTEGER NOT NULL,
    "claseOrigenId" INTEGER,
    "claseUsadaId" INTEGER,
    CONSTRAINT "CreditoClase_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreditoClase_claseOrigenId_fkey" FOREIGN KEY ("claseOrigenId") REFERENCES "Clase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CreditoClase_claseUsadaId_fkey" FOREIGN KEY ("claseUsadaId") REFERENCES "Clase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Penalizacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "porcentaje" REAL NOT NULL DEFAULT 0,
    "motivo" TEXT NOT NULL,
    "aplicada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "claseId" INTEGER,
    CONSTRAINT "Penalizacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Penalizacion_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "Clase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "PasswordResetToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Clase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaHora" DATETIME NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "cupoMaximo" INTEGER NOT NULL DEFAULT 1,
    "precio" REAL NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "qrActivo" BOOLEAN NOT NULL DEFAULT false,
    "serieId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "disciplinaId" INTEGER NOT NULL,
    "profesorId" INTEGER NOT NULL,
    CONSTRAINT "Clase_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Clase_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Clase" ("createdAt", "cupoMaximo", "descripcion", "disciplinaId", "duracionMin", "estado", "fechaHora", "id", "precio", "profesorId", "titulo", "updatedAt") SELECT "createdAt", "cupoMaximo", "descripcion", "disciplinaId", "duracionMin", "estado", "fechaHora", "id", "precio", "profesorId", "titulo", "updatedAt" FROM "Clase";
DROP TABLE "Clase";
ALTER TABLE "new_Clase" RENAME TO "Clase";
CREATE TABLE "new_Pago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monto" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "tipo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "externalReference" TEXT,
    "mercadoPagoPreferenceId" TEXT,
    "mercadoPagoPaymentId" TEXT,
    "initPoint" TEXT,
    "reservaHasta" DATETIME,
    "usuarioId" INTEGER NOT NULL,
    "claseId" INTEGER,
    "penalizacionId" INTEGER,
    CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pago_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "Clase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pago_penalizacionId_fkey" FOREIGN KEY ("penalizacionId") REFERENCES "Penalizacion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pago" ("claseId", "createdAt", "estado", "externalReference", "id", "initPoint", "mercadoPagoPaymentId", "mercadoPagoPreferenceId", "monto", "reservaHasta", "tipo", "updatedAt", "usuarioId") SELECT "claseId", "createdAt", "estado", "externalReference", "id", "initPoint", "mercadoPagoPaymentId", "mercadoPagoPreferenceId", "monto", "reservaHasta", "tipo", "updatedAt", "usuarioId" FROM "Pago";
DROP TABLE "Pago";
ALTER TABLE "new_Pago" RENAME TO "Pago";
CREATE UNIQUE INDEX "Pago_externalReference_key" ON "Pago"("externalReference");
CREATE UNIQUE INDEX "Pago_mercadoPagoPreferenceId_key" ON "Pago"("mercadoPagoPreferenceId");
CREATE UNIQUE INDEX "Pago_mercadoPagoPaymentId_key" ON "Pago"("mercadoPagoPaymentId");
CREATE INDEX "Pago_usuarioId_idx" ON "Pago"("usuarioId");
CREATE INDEX "Pago_claseId_idx" ON "Pago"("claseId");
CREATE INDEX "Pago_estado_idx" ON "Pago"("estado");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CreditoClase_usuarioId_idx" ON "CreditoClase"("usuarioId");

-- CreateIndex
CREATE INDEX "CreditoClase_usado_idx" ON "CreditoClase"("usado");

-- CreateIndex
CREATE INDEX "Penalizacion_usuarioId_idx" ON "Penalizacion"("usuarioId");

-- CreateIndex
CREATE INDEX "Penalizacion_tipo_idx" ON "Penalizacion"("tipo");

-- CreateIndex
CREATE INDEX "Penalizacion_aplicada_idx" ON "Penalizacion"("aplicada");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_usuarioId_idx" ON "PasswordResetToken"("usuarioId");
