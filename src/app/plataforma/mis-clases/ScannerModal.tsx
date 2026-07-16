"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";

export function ScannerModal({
  claseId,
  onClose,
}: {
  claseId: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;
    let html5QrCode: Html5Qrcode | null = null;
    let startPromise: Promise<any> | null = null;

    const init = async () => {
      // Pequeño delay para evitar el doble mount de React 18 Strict Mode
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (!isMounted) return;

      html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const qrCodeSuccessCallback = (decodedText: string) => {
        validarEscaneo(decodedText);
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      try {
        startPromise = html5QrCode.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          () => {}
        );
        await startPromise;
      } catch (err) {
        if (isMounted) {
          setError("No se pudo iniciar la cámara. Verifique los permisos.");
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (startPromise && html5QrCode) {
        startPromise
          .then(() => html5QrCode!.stop())
          .then(() => html5QrCode!.clear())
          .catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validarEscaneo = async (textoOriginal: string) => {
    try {
      // El QR de Sportify debe ser de la forma: .../plataforma/escanear?token=XYZ
      const url = new URL(textoOriginal);
      
      if (!url.pathname.includes("/plataforma/escanear")) {
        throw new Error("Formato inválido");
      }

      const token = url.searchParams.get("token");
      if (!token) {
        throw new Error("Token ausente");
      }

      // Decodificar JWT payload
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      // Verificar que pertenezca a la misma clase
      if (payload.claseId !== claseId) {
        setError("El código QR escaneado no se reconoce como parte de una asistencia vigente para esta clase");
        return;
      }

      // Verificar que el QR siga activo (el profesor no cerró la pantalla)
      try {
        const res = await fetch(`/api/asistencia/qr-activo?claseId=${claseId}`);
        const data = await res.json();
        if (!data.qrActivo) {
          setError("El código QR escaneado no se reconoce como parte de una asistencia vigente para esta clase");
          return;
        }
      } catch {
        // Si falla la consulta, dejamos pasar y que el server-side valide
      }

      // Si es exitoso, pausamos la cámara y redirigimos de forma relativa
      if (scannerRef.current?.isScanning) {
        scannerRef.current.pause();
      }

      router.push(`/plataforma/escanear?token=${token}`);
    } catch (err) {
      setError("El código QR escaneado no se reconoce como parte de una asistencia vigente para esta clase");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: 24,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Escanear QR</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          id="qr-reader"
          style={{ width: "100%", borderRadius: 8, overflow: "hidden" }}
        ></div>

        {error && (
          <div className="form-error" style={{ textAlign: "center", justifyContent: "center" }}>
            ⚠ {error}
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-outline"
          style={{ width: "100%", marginTop: 8 }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
