import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import {
  calcularPrecioAbonoProporcional,
  esMismoDiaYHorario,
  normalizarTipoPago,
  obtenerFinDeMes,
  obtenerInicioDeMes,
  PRECIO_ABONO_MENSUAL,
  TIPOS_PAGO,
} from "@/lib/pagos";
import { obtenerRecargoVigente } from "@/lib/penalizaciones";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const claseId = Number(body.claseId);
    const usuarioId = Number(body.usuarioId);
    const tipoPago = normalizarTipoPago(body.tipoPago);

    if (!claseId || !usuarioId) {
      return NextResponse.json(
        { error: "Faltan datos para iniciar el pago" },
        { status: 400 }
      );
    }

    if (!process.env.APP_URL) {
      return NextResponse.json(
        { error: "Falta configurar APP_URL" },
        { status: 500 }
      );
    }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Falta configurar MERCADO_PAGO_ACCESS_TOKEN" },
        { status: 500 }
      );
    }

    const clase = await prisma.clase.findUnique({
      where: {
        id: claseId,
      },
    });

    if (!clase) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      );
    }

    if (clase.estado !== "ACTIVA") {
      return NextResponse.json(
        { error: "La clase no está disponible" },
        { status: 400 }
      );
    }
    if (tipoPago === TIPOS_PAGO.CLASE_INDIVIDUAL) {
  const limite = new Date();

  limite.setDate(limite.getDate() + 7);

  if (clase.fechaHora > limite) {
    return NextResponse.json(
      {
        error:
          "Las clases individuales sólo pueden reservarse con hasta 7 días de anticipación.",
      },
      {
        status: 400,
      }
    );
  }
}

    let montoAPagar = Number(clase.precio);

if (tipoPago === TIPOS_PAGO.MENSUALIDAD) {
  const inicioDeMes = obtenerInicioDeMes(clase.fechaHora);
  const finDeMes = obtenerFinDeMes(clase.fechaHora);

  const clasesDelMes = await prisma.clase.findMany({
    where: {
      estado: "ACTIVA",
      disciplinaId: clase.disciplinaId,
      fechaHora: {
        gte: inicioDeMes,
        lte: finDeMes,
      },
    },
    orderBy: {
      fechaHora: "asc",
    },
  });

  const clasesMismoDiaYHorario = clasesDelMes.filter((claseDelMes) =>
    esMismoDiaYHorario(clase.fechaHora, claseDelMes.fechaHora)
  );

  const clasesRestantesDelMes = clasesMismoDiaYHorario.filter(
    (claseDelMes) => claseDelMes.fechaHora >= clase.fechaHora
  );

  montoAPagar = calcularPrecioAbonoProporcional({
    precioMensual: PRECIO_ABONO_MENSUAL,
    totalClasesDelMes: clasesMismoDiaYHorario.length,
    clasesRestantesDelMes: clasesRestantesDelMes.length,
  });

let fechaDisponible: Date | null = null;

for (let i = 0; i < clasesRestantesDelMes.length; i++) {
  const claseInicio = clasesRestantesDelMes[i];

  let puedeComenzarDesdeAca = true;

  for (let j = i; j < clasesRestantesDelMes.length; j++) {
    const claseAValidar = clasesRestantesDelMes[j];

    const inscriptos = await prisma.inscripcion.count({
      where: {
        claseId: claseAValidar.id,
        estado: "ACTIVA",
      },
    });

    const reservasPendientes = await prisma.pago.count({
      where: {
        claseId: claseAValidar.id,
        estado: "PENDIENTE",
        reservaHasta: {
          gt: new Date(),
        },
      },
    });

    const lugaresOcupados = inscriptos + reservasPendientes;

    if (lugaresOcupados >= claseAValidar.cupoMaximo) {
      puedeComenzarDesdeAca = false;
      break;
    }
  }

  if (puedeComenzarDesdeAca) {
    fechaDisponible = claseInicio.fechaHora;
    break;
  }
}
if (!fechaDisponible) {
  return NextResponse.json(
    {
      error:
        "No hay disponibilidad para iniciar el abono en las clases restantes de este mes.",
    },
    {
      status: 400,
    }
  );
}

if (fechaDisponible.getTime() !== clase.fechaHora.getTime()) {
  const fecha = fechaDisponible.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return NextResponse.json(
    {
      error: `Este turno no tiene disponibilidad para comenzar ahora. Podés anotarte a partir del ${fecha}.`,
    },
    {
      status: 400,
    }
  );
}
}
    if (montoAPagar <= 0) {
      return NextResponse.json(
        { error: "El pago no tiene un monto válido" },
        { status: 400 }
      );
    }

    const ahora = new Date();

    const yaInscripto = await prisma.inscripcion.findUnique({
      where: {
        usuarioId_claseId: {
          usuarioId,
          claseId: clase.id,
        },
      },
    });

    if (yaInscripto?.estado === "ACTIVA") {
      return NextResponse.json(
        { error: "Ya estás inscripta en esta clase" },
        { status: 400 }
      );
    }

    const pagoPendienteExistente = await prisma.pago.findFirst({
      where: {
        usuarioId,
        claseId: clase.id,
        tipo: tipoPago,
        estado: "PENDIENTE",
        reservaHasta: {
          gt: ahora,
        },
        initPoint: {
          not: null,
        },
      },
    });

    if (pagoPendienteExistente?.initPoint) {
      return NextResponse.json({
        initPoint: pagoPendienteExistente.initPoint,
      });
    }

    const inscriptos = await prisma.inscripcion.count({
      where: {
        claseId: clase.id,
        estado: "ACTIVA",
      },
    });

    const reservasPendientes = await prisma.pago.count({
      where: {
        claseId: clase.id,
        estado: "PENDIENTE",
        reservaHasta: {
          gt: ahora,
        },
      },
    });

    const lugaresOcupados = inscriptos + reservasPendientes;

    if (lugaresOcupados >= clase.cupoMaximo) {
      return NextResponse.json(
        { error: "No hay cupo disponible para esta clase" },
        { status: 400 }
      );
    }

    if (tipoPago === TIPOS_PAGO.CLASE_INDIVIDUAL) {
      const librestotal = clase.cupoMaximo - lugaresOcupados;

      const miEntradaListaEspera = await prisma.listaEspera.findUnique({
        where: {
          usuarioId_claseId: {
            usuarioId,
            claseId: clase.id,
          },
        },
      });

      let permitido: boolean;

      if (miEntradaListaEspera) {
        permitido = miEntradaListaEspera.posicion <= librestotal;
      } else {
        const enEspera = await prisma.listaEspera.count({
          where: { claseId: clase.id },
        });
        permitido = librestotal - enEspera > 0;
      }

      if (!permitido) {
        return NextResponse.json(
          {
            error:
              "Esta clase tiene lista de espera. Anotate para confirmar tu lugar cuando se libere un cupo.",
          },
          { status: 400 }
        );
      }
    }

    const recargoVigente = await obtenerRecargoVigente(usuarioId, tipoPago);

    if (recargoVigente) {
      montoAPagar = montoAPagar * (1 + recargoVigente.porcentaje / 100);
    }

    const reservaHasta = new Date(Date.now() + 15 * 60 * 1000);

    const pago = await prisma.pago.create({
      data: {
        usuarioId,
        claseId: clase.id,
        monto: montoAPagar,
        estado: "PENDIENTE",
        tipo: tipoPago,
        externalReference: `sportify-pago-${crypto.randomUUID()}`,
        reservaHasta,
        penalizacionId: recargoVigente?.id,
      },
    });

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });

    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        items: [
          {
            id: String(clase.id),
            title:
              tipoPago === TIPOS_PAGO.MENSUALIDAD
                ? `Abono mensual - ${clase.titulo}`
                : `Inscripción a ${clase.titulo}`,
            quantity: 1,
            unit_price: montoAPagar,
            currency_id: "ARS",
          },
        ],
        external_reference: pago.externalReference ?? undefined,
        notification_url: `${process.env.APP_URL}/api/mercado-pago/webhook`,
        back_urls: {
          success: `${process.env.APP_URL}/pagos/resultado?resultado=success&pagoId=${pago.id}`,
          failure: `${process.env.APP_URL}/pagos/resultado?resultado=failure&pagoId=${pago.id}`,
          pending: `${process.env.APP_URL}/pagos/resultado?resultado=pending&pagoId=${pago.id}`,
        },
        auto_return: "approved",
      },
    });

    if (!resultado.id || !resultado.init_point) {
      return NextResponse.json(
        { error: "No se pudo crear la preferencia de pago" },
        { status: 500 }
      );
    }

    await prisma.pago.update({
      where: {
        id: pago.id,
      },
      data: {
        mercadoPagoPreferenceId: String(resultado.id),
        initPoint: resultado.init_point,
      },
    });

    return NextResponse.json({
      initPoint: resultado.init_point,
    });
  } catch (error) {
    const detalle =
      error instanceof Error
        ? error.message
        : typeof error === "object"
          ? JSON.stringify(error)
          : String(error);

    console.error("Error creando preferencia de Mercado Pago:", error);

    return NextResponse.json(
      {
        error: "Error al iniciar el pago",
        detalle,
      },
      { status: 500 }
    );
  }
}