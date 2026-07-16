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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
