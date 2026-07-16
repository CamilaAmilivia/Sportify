-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ListaEspera" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "posicion" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'CLASE_INDIVIDUAL',
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "claseId" INTEGER NOT NULL,
    "pagoId" INTEGER,
    CONSTRAINT "ListaEspera_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ListaEspera_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "Clase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ListaEspera_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ListaEspera" ("claseId", "createdAt", "id", "posicion", "usuarioId") SELECT "claseId", "createdAt", "id", "posicion", "usuarioId" FROM "ListaEspera";
DROP TABLE "ListaEspera";
ALTER TABLE "new_ListaEspera" RENAME TO "ListaEspera";
CREATE INDEX "ListaEspera_claseId_idx" ON "ListaEspera"("claseId");
CREATE INDEX "ListaEspera_tipo_idx" ON "ListaEspera"("tipo");
CREATE INDEX "ListaEspera_prioridad_idx" ON "ListaEspera"("prioridad");
CREATE UNIQUE INDEX "ListaEspera_usuarioId_claseId_key" ON "ListaEspera"("usuarioId", "claseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
