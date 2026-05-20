import CalendarioSemanal from '@/components/ui/CalendarioSemanal'
import { DetalleClase } from './detalle-clase'

type Props = {
  searchParams: Promise<{ claseId?: string }>
}

export default async function CronogramaPage({ searchParams }: Props) {
  const { claseId } = await searchParams

  if (claseId) {
    return (
      <div style={{ padding: '32px 40px' }}>
        <DetalleClase claseId={Number(claseId)} />
      </div>
    )
  }

  return <CalendarioSemanal />
}