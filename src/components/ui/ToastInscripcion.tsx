"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

export function ToastInscripcion() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const tipoToast = searchParams.get("toast");
    const nombreClase = searchParams.get("clase");

    if (!tipoToast) return;

    if (tipoToast === "inscripcion-ok") {
      toast.success("Inscripción completada correctamente.");
    }

    if (tipoToast === "pago-ok") {
      toast.success("Pago aprobado. Inscripción completada correctamente.");
    }

    if (tipoToast === "lista-espera-ok") {
      toast.success(
        nombreClase
          ? `Te anotaste correctamente en lista de espera para ${nombreClase}.`
          : "Te anotaste correctamente en lista de espera."
      );
    }

    const params = new URLSearchParams(searchParams.toString());

    params.delete("toast");
    params.delete("clase");

    const nuevaUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(nuevaUrl, { scroll: false });
  }, [searchParams, router, pathname]);

  return null;
}