export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo'

export interface Actividad {
  id: number
  nombre: string
  descripcion?: string
  instructor: string
  dia: DiaSemana
  horaInicio: string   // formato "HH:mm"
  horaFin: string      // formato "HH:mm"
  capacidadMaxima: number
  inscriptos: number
  color?: string       // clase tailwind de color, ej: "bg-blue-500"
  salon?: string
  /**
   * Cupos realmente disponibles para el público, restando los reservados
   * por la lista de espera. Si no se pasa, se calcula con
   * capacidadMaxima - inscriptos.
   */
  disponiblesReales?: number
}