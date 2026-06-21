// Al inicio de CalendarioSemanal.tsx, antes del primer import de react
'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Actividad, DiaSemana } from './types'
import type { PronosticoDia } from '@/lib/clima'
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
        block w-full text-left rounded-xl border-l-4 p-3.5 mb-2.5 shadow-sm transition-all duration-150
        hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
        ${c.bg} ${c.borde}
        ${lleno ? 'opacity-70' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className={`font-semibold text-sm leading-tight ${c.texto}`}>
          {actividad.nombre}
        </span>
        {lleno && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap shrink-0">
            Lleno
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
        <span aria-hidden>🕐</span> {actividad.horaInicio} – {actividad.horaFin}
      </p>

      <p className="text-xs text-slate-600 truncate mb-0.5">👤 {actividad.instructor}</p>

      {actividad.salon && (
        <p className="text-xs text-slate-500 truncate">📍 {actividad.salon}</p>
      )}

      {/* Barra de capacidad */}
      <div className="mt-2.5">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
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
  /**
   * Pronóstico del clima por día, indexado por fecha "yyyy-MM-dd".
   */
  clima?: Record<string, PronosticoDia>
}

export default function CalendarioSemanal({ actividades = [], clima = {} }: CalendarioSemanalProps) {
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
      <header className="max-w-7xl mx-auto px-5 pt-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-5 py-6 flex flex-col items-center gap-5">
          {/* Título */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Calendario de actividades</h1>
            <p className="text-sm text-slate-500 capitalize mt-1">
              {format(semanaBase, "d 'de' MMMM", { locale: es })} –{' '}
              {format(addDays(semanaBase, 6), "d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>

          {/* Buscador + navegación de semana */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <div className="relative">
              <input
                type="search"
                placeholder="Buscar actividad…"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                className="appearance-none border border-slate-200 rounded-full pl-4 pr-10 py-2 text-sm text-slate-700 w-52 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
              />
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 rounded-full p-1 border border-slate-200">
              <button
                onClick={irSemanaAnterior}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                aria-label="Semana anterior"
              >
                ←
              </button>
              <button
                onClick={irHoy}
                className="px-3.5 py-1.5 rounded-full hover:bg-white hover:shadow-sm text-slate-600 text-sm font-medium transition-all"
              >
                Hoy
              </button>
              <button
                onClick={irSemanaSiguiente}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                aria-label="Semana siguiente"
              >
                →
              </button>
            </div>
          </div>

          {/* Filtro por día (pills) */}
          <div className="flex gap-4 flex-wrap justify-center border-t border-slate-100 pt-5 w-full max-w-3xl mx-auto">
            {(['Todos', ...DIAS] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFiltroDia(d)}
                className={`
                  px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150
                  ${filtroDia === d
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}
                `}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Grilla de días ── */}
      <main className="max-w-7xl mx-auto px-5 pt-10 pb-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-5">
          {diasConFecha.map(({ dia, fecha }) => {
            const esHoy = format(fecha, 'EEEE', { locale: es }).toLowerCase() === hoy.toLowerCase()
            const items = actividadesPorDia(dia)

            // Si hay filtro de día activo y no es este día, ocultar
            if (filtroDia !== 'Todos' && filtroDia !== dia) return null

            return (
              <div
                key={dia}
                className={`
                  flex flex-col rounded-2xl border-2 overflow-hidden shadow-sm transition-shadow
                  ${esHoy ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-300 hover:shadow-md'}
                `}
              >
                {/* Cabecera del día */}
                <div
                  className={`
                    px-4 py-4 text-center
                    ${esHoy
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border-b border-slate-100'}
                  `}
                >
                  <p className="font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-1.5">
                    {dia}
                    {clima[format(fecha, 'yyyy-MM-dd')]?.icono && (
                      <span aria-hidden>{clima[format(fecha, 'yyyy-MM-dd')].icono}</span>
                    )}
                  </p>
                  <p className={`text-xs mt-1 font-medium ${esHoy ? 'text-blue-100' : 'text-slate-400'}`}>
                    {format(fecha, "d MMM", { locale: es })}
                    {clima[format(fecha, 'yyyy-MM-dd')] && (
                      <> · {clima[format(fecha, 'yyyy-MM-dd')].temperaturaMax}°</>
                    )}
                  </p>
                </div>

                {/* Columna de actividades */}
                <div
                  className={`
                    flex-1 p-3 min-h-52
                    ${esHoy ? 'bg-blue-50/30' : 'bg-gradient-to-b from-green-50/70 to-white'}
                  `}
                >
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-1.5">
                      <span className="text-2xl opacity-40" aria-hidden>🗓️</span>
                      <p className="text-xs text-slate-300">Sin actividades</p>
                    </div>
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
        <div className="mt-7 flex flex-wrap gap-5 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Disponible</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Casi lleno (+75%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Completo</span>
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
