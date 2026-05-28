// Al inicio de CalendarioSemanal.tsx, antes del primer import de react
'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Actividad, DiaSemana } from './types'
import Link from 'next/link'  // ← este import va arriba del archivo, no acá

// ─── Datos de ejemplo ────────────────────────────────────────────────────────
// Reemplazá esto con datos reales provenientes de tu API / Prisma
const ACTIVIDADES_EJEMPLO: Actividad[] = [
  {
    id: 1,
    nombre: 'Yoga',
    descripcion: 'Clase de yoga para todos los niveles.',
    instructor: 'Laura Méndez',
    dia: 'Lunes',
    horaInicio: '08:00',
    horaFin: '09:00',
    capacidadMaxima: 20,
    inscriptos: 14,
    color: 'teal',
    salon: 'Sala A',
  },
  {
    id: 2,
    nombre: 'Spinning',
    descripcion: 'Ciclismo indoor de alta intensidad.',
    instructor: 'Carlos Ríos',
    dia: 'Lunes',
    horaInicio: '10:00',
    horaFin: '11:00',
    capacidadMaxima: 15,
    inscriptos: 15,
    color: 'coral',
    salon: 'Sala B',
  },
  {
    id: 3,
    nombre: 'Pilates',
    descripcion: 'Fortalecimiento y flexibilidad.',
    instructor: 'Ana Torres',
    dia: 'Martes',
    horaInicio: '09:00',
    horaFin: '10:00',
    capacidadMaxima: 12,
    inscriptos: 8,
    color: 'purple',
    salon: 'Sala A',
  },
  {
    id: 4,
    nombre: 'Funcional',
    descripcion: 'Entrenamiento funcional en circuito.',
    instructor: 'Diego Paz',
    dia: 'Miércoles',
    horaInicio: '07:00',
    horaFin: '08:00',
    capacidadMaxima: 18,
    inscriptos: 10,
    color: 'amber',
    salon: 'Sala C',
  },
  {
    id: 5,
    nombre: 'Zumba',
    descripcion: 'Baile y fitness al ritmo de la música.',
    instructor: 'María López',
    dia: 'Jueves',
    horaInicio: '18:00',
    horaFin: '19:00',
    capacidadMaxima: 25,
    inscriptos: 20,
    color: 'pink',
    salon: 'Sala B',
  },
  {
    id: 6,
    nombre: 'CrossFit',
    descripcion: 'Entrenamiento de alta intensidad.',
    instructor: 'Tomás Vera',
    dia: 'Viernes',
    horaInicio: '19:00',
    horaFin: '20:00',
    capacidadMaxima: 16,
    inscriptos: 7,
    color: 'red',
    salon: 'Sala C',
  },
  {
    id: 7,
    nombre: 'Natación',
    descripcion: 'Clases de natación para adultos.',
    instructor: 'Paula Suárez',
    dia: 'Sábado',
    horaInicio: '10:00',
    horaFin: '11:30',
    capacidadMaxima: 10,
    inscriptos: 6,
    color: 'blue',
    salon: 'Pileta',
  },
]

// ─── Configuración visual por color ──────────────────────────────────────────
const PALETA: Record<string, { bg: string; borde: string; texto: string; badge: string }> = {
  teal:   { bg: 'bg-teal-50',   borde: 'border-teal-400',   texto: 'text-teal-800',   badge: 'bg-teal-100 text-teal-700'   },
  coral:  { bg: 'bg-orange-50', borde: 'border-orange-400', texto: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' },
  purple: { bg: 'bg-purple-50', borde: 'border-purple-400', texto: 'text-purple-800', badge: 'bg-purple-100 text-purple-700' },
  amber:  { bg: 'bg-amber-50',  borde: 'border-amber-400',  texto: 'text-amber-800',  badge: 'bg-amber-100 text-amber-700'  },
  pink:   { bg: 'bg-pink-50',   borde: 'border-pink-400',   texto: 'text-pink-800',   badge: 'bg-pink-100 text-pink-700'   },
  red:    { bg: 'bg-red-50',    borde: 'border-red-400',    texto: 'text-red-800',    badge: 'bg-red-100 text-red-700'     },
  blue:   { bg: 'bg-blue-50',   borde: 'border-blue-400',   texto: 'text-blue-800',   badge: 'bg-blue-100 text-blue-700'   },
  green:  { bg: 'bg-green-50',  borde: 'border-green-400',  texto: 'text-green-800',  badge: 'bg-green-100 text-green-700' },
}

const colorDe = (color?: string) => PALETA[color ?? 'blue'] ?? PALETA['blue']

const DIAS: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// ─── Utilidades ──────────────────────────────────────────────────────────────
function horaAMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function porcentajeLleno(inscriptos: number, capacidad: number) {
  return Math.min(100, Math.round((inscriptos / capacidad) * 100))
}

// ─── Sub-componente: tarjeta de actividad ─────────────────────────────────────
interface TarjetaActividadProps {
  actividad: Actividad
  onClick: (a: Actividad) => void
}

function TarjetaActividad({ actividad }: { actividad: Actividad }) {
  const c = colorDe(actividad.color)
  const lleno = actividad.inscriptos >= actividad.capacidadMaxima
  const pct = porcentajeLleno(actividad.inscriptos, actividad.capacidadMaxima)

  return (
    <Link
      href={`/plataforma/cronograma?claseId=${actividad.id}`}
      className={`
        block w-full text-left rounded-lg border-l-4 p-3 mb-2 transition-all duration-150
        hover:shadow-md hover:-translate-y-0.5 active:scale-95
        ${c.bg} ${c.borde}
        ${lleno ? 'opacity-70' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className={`font-semibold text-sm leading-tight ${c.texto}`}>
          {actividad.nombre}
        </span>
        {lleno && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 whitespace-nowrap shrink-0">
            Lleno
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-1">
        {actividad.horaInicio} – {actividad.horaFin}
      </p>

      <p className="text-xs text-slate-600 truncate">👤 {actividad.instructor}</p>

      {actividad.salon && (
        <p className="text-xs text-slate-500 truncate">📍 {actividad.salon}</p>
      )}

      {/* Barra de capacidad */}
      <div className="mt-2">
        <div className="flex justify-between text-xs text-slate-400 mb-0.5">
          <span>{actividad.inscriptos}/{actividad.capacidadMaxima} inscriptos</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${lleno ? 'bg-red-400' : pct > 75 ? 'bg-amber-400' : 'bg-green-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  )
}

// ─── Sub-componente: modal de detalle / inscripción ───────────────────────────
interface ModalActividadProps {
  actividad: Actividad
  onCerrar: () => void
}

function ModalActividad({ actividad, onCerrar }: ModalActividadProps) {
  const c = colorDe(actividad.color)
  const lleno = actividad.inscriptos >= actividad.capacidadMaxima
  const pct = porcentajeLleno(actividad.inscriptos, actividad.capacidadMaxima)

  return (
    // Fondo oscuro — posición normal-flow para no colapsar el iframe
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCerrar}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera con color */}
        <div className={`${c.bg} ${c.borde} border-b-4 px-6 py-5`}>
          <button
            onClick={onCerrar}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <h2 className={`text-xl font-bold ${c.texto}`}>{actividad.nombre}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{actividad.dia} · {actividad.horaInicio} – {actividad.horaFin}</p>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 space-y-3">
          {actividad.descripcion && (
            <p className="text-slate-600 text-sm">{actividad.descripcion}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-slate-400 text-xs mb-0.5">Instructor</p>
              <p className="font-medium text-slate-700">{actividad.instructor}</p>
            </div>
            {actividad.salon && (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-slate-400 text-xs mb-0.5">Salón</p>
                <p className="font-medium text-slate-700">{actividad.salon}</p>
              </div>
            )}
          </div>

          {/* Capacidad */}
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Capacidad</span>
              <span>{actividad.inscriptos}/{actividad.capacidadMaxima} ({pct}%)</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${lleno ? 'bg-red-400' : pct > 75 ? 'bg-amber-400' : 'bg-green-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Botón de inscripción */}

<Link
  href={`/plataforma/cronograma?claseId=${actividad.id}`}
  style={{ pointerEvents: lleno ? 'none' : 'auto' }}
  className={`
    block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all border
    ${lleno
      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
      : `${c.bg} ${c.texto} border ${c.borde} hover:opacity-80`
    }
  `}
>
  {lleno ? 'Actividad completa' : 'Inscribirme'}
</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal: CalendarioSemanal ──────────────────────────────────
interface CalendarioSemanalProps {
  /**
   * Actividades a mostrar. Si no se pasan, se usan datos de ejemplo.
   * En producción, pasá las actividades desde tu Server Component usando Prisma.
   */
  actividades?: Actividad[]
}

export default function CalendarioSemanal({ actividades = [] }: CalendarioSemanalProps) {
  const [semanaBase, setSemanaBase] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const router = useRouter()
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null)
  const [filtroDia, setFiltroDia] = useState<DiaSemana | 'Todos'>('Todos')
  const [filtroNombre, setFiltroNombre] = useState('')

  // Fechas de la semana actual
  const diasConFecha = useMemo(() =>
    DIAS.map((dia, i) => ({
      dia,
      fecha: addDays(semanaBase, i),
    })), [semanaBase])

  // Actividades filtradas y ordenadas
  const actividadesFiltradas = useMemo(() => {
    return actividades
      .filter((a) => filtroDia === 'Todos' || a.dia === filtroDia)
      .filter((a) => a.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
      .sort((a, b) => horaAMinutos(a.horaInicio) - horaAMinutos(b.horaInicio))
  }, [actividades, filtroDia, filtroNombre])

  const actividadesPorDia = (dia: DiaSemana) =>
    actividadesFiltradas.filter((a) => a.dia === dia)

const irSemanaAnterior = () => {
  const nueva = addDays(semanaBase, -7)
  setSemanaBase(nueva)
  router.push(`/plataforma/cronograma?semana=${format(nueva, 'yyyy-MM-dd')}`)
}

const irSemanaSiguiente = () => {
  const nueva = addDays(semanaBase, 7)
  setSemanaBase(nueva)
  router.push(`/plataforma/cronograma?semana=${format(nueva, 'yyyy-MM-dd')}`)
}

const irHoy = () => {
  const nueva = startOfWeek(new Date(), { weekStartsOn: 1 })
  setSemanaBase(nueva)
  router.push(`/plataforma/cronograma`)
}

  const hoy = format(new Date(), 'EEEE', { locale: es })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Encabezado ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Calendario de actividades</h1>
            <p className="text-sm text-slate-500 capitalize">
              {format(semanaBase, "d 'de' MMMM", { locale: es })} –{' '}
              {format(addDays(semanaBase, 6), "d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtro por nombre */}
            <input
              type="search"
              placeholder="Buscar actividad…"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 w-44 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />

            {/* Navegación de semana */}
            <button
              onClick={irSemanaAnterior}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              aria-label="Semana anterior"
            >
              ←
            </button>
            <button
              onClick={irHoy}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm"
            >
              Hoy
            </button>
            <button
              onClick={irSemanaSiguiente}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              aria-label="Semana siguiente"
            >
              →
            </button>
          </div>
        </div>

        {/* Filtro por día (pills) */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {(['Todos', ...DIAS] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFiltroDia(d)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${filtroDia === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
              `}
            >
              {d}
            </button>
          ))}
        </div>
      </header>

      {/* ── Grilla de días ── */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {diasConFecha.map(({ dia, fecha }) => {
            const esHoy = format(fecha, 'EEEE', { locale: es }).toLowerCase() === hoy.toLowerCase()
            const items = actividadesPorDia(dia)

            // Si hay filtro de día activo y no es este día, ocultar
            if (filtroDia !== 'Todos' && filtroDia !== dia) return null

            return (
              <div key={dia} className="flex flex-col">
                {/* Cabecera del día */}
                <div
                  className={`
                    rounded-t-xl px-3 py-2 mb-0 border border-b-0
                    ${esHoy
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700'}
                  `}
                >
                  <p className="font-semibold text-sm">{dia}</p>
                  <p className={`text-xs ${esHoy ? 'text-blue-100' : 'text-slate-400'}`}>
                    {format(fecha, "d MMM", { locale: es })}
                  </p>
                </div>

                {/* Columna de actividades */}
                <div
                  className={`
                    flex-1 rounded-b-xl border p-2 min-h-48
                    ${esHoy ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'}
                  `}
                >
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-300 text-center mt-6">Sin actividades</p>
                  ) : (
                    items.map((act) => (
                      <TarjetaActividad
                      key={act.id}
                      actividad={act}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Leyenda */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Disponible</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Casi lleno (+75%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Completo</span>
        </div>
      </main>

      {/* ── Modal de inscripción ── */}
      {actividadSeleccionada && (
        <ModalActividad
          actividad={actividadSeleccionada}
          onCerrar={() => setActividadSeleccionada(null)}
        />
      )}
    </div>
  )
}
