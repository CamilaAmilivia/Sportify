"use client";

import { useActionState, useState, useEffect } from "react";
import { cambiarEmail, CambioEmailState } from "./actions";

const estadoInicial: CambioEmailState = {};

export default function FormularioCambioEmail() {
  const [state, action, isPending] = useActionState(
    cambiarEmail,
    estadoInicial
  );

  const [showModal, setShowModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // Si el servidor devuelve un error, cerramos el modal para mostrarlo en el formulario principal
  useEffect(() => {
    if (state.errores && Object.keys(state.errores).length > 0) {
      setShowModal(false);
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Si el modal no está visible, detenemos el envío para mostrarlo
    if (!showModal) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const nuevoEmail = formData.get("nuevoEmail")?.toString().trim();
      
      if (nuevoEmail) {
        setPendingEmail(nuevoEmail);
        setShowModal(true);
      }
    }
    // Si el modal está visible, dejamos que el evento continúe para enviar el formulario
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-8 relative">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Cambiar Dirección de Correo Electrónico
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Por razones de seguridad, deberás ingresar tu contraseña actual. Al confirmar el cambio, se cerrará tu sesión actual y deberás iniciar sesión nuevamente con tu nuevo correo.
      </p>

      <form
        id="formulario-cambio-email"
        action={action}
        onSubmit={handleSubmit}
        className="max-w-md space-y-4"
      >
        {/* Error general */}
        {state.errores?.general && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
            ⚠ {state.errores.general[0]}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="nuevoEmail" className="block text-sm font-semibold text-gray-700">
            Nuevo Correo Electrónico
          </label>
          <input
            id="nuevoEmail"
            name="nuevoEmail"
            type="email"
            placeholder="nuevo@email.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={isPending || showModal}
          />
          {state.errores?.email && (
            <span className="text-red-500 text-xs mt-1 block">⚠ {state.errores.email[0]}</span>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Contraseña Actual
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={isPending || showModal}
          />
          {state.errores?.password && (
            <span className="text-red-500 text-xs mt-1 block">⚠ {state.errores.password[0]}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || showModal}
          className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {isPending ? "Procesando..." : "Cambiar Correo"}
        </button>
      </form>

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100 overflow-hidden relative">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              ¿Confirmar cambio?
            </h4>
            <p className="text-gray-600 text-sm mb-6">
              ¿Desea cambiar su mail a <span className="font-semibold text-gray-900">"{pendingEmail}"</span>?
              <br/><br/>
              Deberá volver a iniciar sesión con el nuevo correo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="formulario-cambio-email"
                className="flex-1 py-2 px-4 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
