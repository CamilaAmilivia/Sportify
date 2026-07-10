-- CreateTable
CREATE TABLE "Notificacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_idx" ON "Notificacion"("usuarioId");

-- CreateIndex
CREATE INDEX "Notificacion_leida_idx" ON "Notificacion"("leida");
