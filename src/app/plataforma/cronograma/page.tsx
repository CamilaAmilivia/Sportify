import CalendarioSemanal from '@/components/ui/CalendarioSemanal'
import { DetalleClase } from './detalle-clase'
import { getClasesSemana } from './actions'
import { format, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { ResumenInscripcion } from './resumen'

type Props = {
  searchParams: Promise<{ claseId?: string ; vista?: string ; tipoPago?: string}>
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
 const { claseId, vista, tipoPago } = await searchParams

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

  const clases = await getClasesSemana(new Date())

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

  return <CalendarioSemanal actividades={actividades} />
}