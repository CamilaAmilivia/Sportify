"use client";

import { useActionState } from "react";
import { cambiarEmail, CambioEmailState } from "./actions";

const estadoInicial: CambioEmailState = {};

export default function FormularioCambioEmail() {
  const [state, action, isPending] = useActionState(
    cambiarEmail,
    estadoInicial
  );

  return (
    <div className="mt-20 border-t border-gray-200 pt-12 relative">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Cambiar dirección de correo electrónico
      </h3>
      <p className="text-sm text-gray-500 mb-8">
        Por razones de seguridad, deberás ingresar tu contraseña actual. Al confirmar el cambio, se cerrará tu sesión actual y deberás iniciar sesión nuevamente con tu nuevo correo.
      </p>

      <form
        id="formulario-cambio-email"
        action={action}
        className="max-w-md space-y-8"
        autoComplete="off"
      >
        {/* Error general */}
        {state.errores?.general && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
            ⚠ {state.errores.general[0]}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="nuevoEmail" className="block text-sm font-semibold text-gray-700">
            Nuevo correo electrónico
          </label>
          <input
            id="nuevoEmail"
            name="nuevoEmail"
            type="email"
            placeholder="nuevo@email.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={isPending}
            autoComplete="off"
          />
          {state.errores?.email && (
            <span className="text-red-500 text-xs mt-1 block">⚠ {state.errores.email[0]}</span>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmarEmail" className="block text-sm font-semibold text-gray-700">
            Confirmar Nuevo Correo
          </label>
          <input
            id="confirmarEmail"
            name="confirmarEmail"
            type="email"
            placeholder="Repite el nuevo correo"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={isPending}
            autoComplete="off"
          />
          {state.errores?.confirmarEmail && (
            <span className="text-red-500 text-xs mt-1 block">⚠ {state.errores.confirmarEmail[0]}</span>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Contraseña actual
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={isPending}
            autoComplete="new-password"
          />
          {state.errores?.password && (
            <span className="text-red-500 text-xs mt-1 block">⚠ {state.errores.password[0]}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-12 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 text-lg"
        >
          {isPending ? "Procesando..." : "Cambiar correo"}
        </button>
      </form>
    </div>
  );
}
