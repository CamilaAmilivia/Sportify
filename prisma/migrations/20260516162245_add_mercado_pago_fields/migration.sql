/*
  Warnings:

  - Added the required column `updatedAt` to the `Pago` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Clase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaHora" DATETIME NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "cupoMaximo" INTEGER NOT NULL,
    "precio" REAL NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "disciplinaId" INTEGER NOT NULL,
    "profesorId" INTEGER NOT NULL,
    CONSTRAINT "Clase_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Clase_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Clase" ("createdAt", "cupoMaximo", "descripcion", "disciplinaId", "duracionMin", "estado", "fechaHora", "id", "profesorId", "titulo", "updatedAt") SELECT "createdAt", "cupoMaximo", "descripcion", "disciplinaId", "duracionMin", "estado", "fechaHora", "id", "profesorId", "titulo", "updatedAt" FROM "Clase";
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
    CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pago_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "Clase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pago" ("createdAt", "estado", "id", "monto", "tipo", "usuarioId") SELECT "createdAt", "estado", "id", "monto", "tipo", "usuarioId" FROM "Pago";
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
