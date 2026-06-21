import CalendarioSemanal from '@/components/ui/CalendarioSemanal'
import { DetalleClase } from './detalle-clase'
import { getClasesSemana } from './actions'
import { format, addMinutes, addDays, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ResumenInscripcion } from './resumen'
import { ToastInscripcion } from "@/components/ui/ToastInscripcion";
import { obtenerPronosticoSemana } from '@/lib/clima'

type Props = {
  searchParams: Promise<{ claseId?: string; vista?: string; semana?: string ; tipoPago?: string}>
}

const COLORES_POR_DISCIPLINA: Record<string, string> = {
  'Funcional': 'amber',
  'Yoga':      'teal',
  'Spinning':  'coral',
  'Pilates':   'purple',
  'Zumba':     'pink',
  'CrossFit':  'red',
  'Natación':  'blue',
}

export default async function CronogramaPage({ searchParams }: Props) {

  const { claseId, vista, semana , tipoPago} = await searchParams

if (claseId && vista === 'resumen') {
  return (
    <div style={{ padding: '32px 40px' }}>
      <ResumenInscripcion claseId={Number(claseId)} tipoPago={tipoPago} />
    </div>
  )
}

if (claseId) {
  return (
    <div style={{ padding: '32px 40px' }}>
      <DetalleClase claseId={Number(claseId)} />
    </div>
  )
}

  const fechaBase = semana ? new Date(semana + 'T12:00:00') : new Date()
  const clases = await getClasesSemana(fechaBase)

  const inicioSemana = startOfWeek(fechaBase, { weekStartsOn: 1 })
  const finSemana = addDays(inicioSemana, 6)
  const clima = await obtenerPronosticoSemana(inicioSemana, finSemana)
  const actividades = clases.map((clase) => {
    const horaFin = addMinutes(clase.fechaHora, clase.duracionMin)
    const dia = format(clase.fechaHora, 'EEEE', { locale: es })
    const diaCapitalizado = (dia.charAt(0).toUpperCase() + dia.slice(1)) as 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'

    return {
      id:              clase.id,
      nombre:          clase.titulo,
      descripcion:     clase.descripcion ?? undefined,
      instructor:      `${clase.profesor.nombre} ${clase.profesor.apellido}`,
      dia:             diaCapitalizado,
      horaInicio:      format(clase.fechaHora, 'HH:mm'),
      horaFin:         format(horaFin, 'HH:mm'),
      capacidadMaxima: clase.cupoMaximo,
      inscriptos:      clase._count.inscripciones,
      color:           COLORES_POR_DISCIPLINA[clase.disciplina.nombre] ?? 'blue',
    }
  })

  return (
    <>
    <ToastInscripcion />
    <CalendarioSemanal actividades={actividades} clima={clima} />
    </>
  )
}