import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const { claseId, usuarioId } = await request.json();

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

    const clase = await prisma.clase.findUnique({
      where: { id: Number(claseId) },
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

    if (clase.precio <= 0) {
      return NextResponse.json(
        { error: "La clase no tiene un precio válido" },
        { status: 400 }
      );
    }

    const ahora = new Date();

    const yaInscripto = await prisma.inscripcion.findUnique({
      where: {
        usuarioId_claseId: {
          usuarioId: Number(usuarioId),
          claseId: clase.id,
        },
      },
    });

    if (yaInscripto) {
      return NextResponse.json(
        { error: "El usuario ya está inscripto en esta clase" },
        { status: 400 }
      );
    }

    const pagoPendienteExistente = await prisma.pago.findFirst({
      where: {
        usuarioId: Number(usuarioId),
        claseId: clase.id,
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

    const reservaHasta = new Date(Date.now() + 15 * 60 * 1000);

    const pago = await prisma.pago.create({
      data: {
        usuarioId: Number(usuarioId),
        claseId: clase.id,
        monto: clase.precio,
        estado: "PENDIENTE",
        tipo: "CLASE_INDIVIDUAL",
        externalReference: `sportify-pago-${crypto.randomUUID()}`,
        reservaHasta,
      },
    });

    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        items: [
          {
            id: String(clase.id),
            title: `Inscripción a ${clase.titulo}`,
            quantity: 1,
            unit_price: Number(clase.precio),
            currency_id: "ARS",
          },
        ],
        external_reference: pago.externalReference ?? undefined,
        notification_url: `${process.env.APP_URL}/api/mercado-pago/webhook`,
        back_urls: {
          success: `${process.env.APP_URL}/plataforma/pagos/resultado`,
          failure: `${process.env.APP_URL}/plataforma/pagos/resultado`,
          pending: `${process.env.APP_URL}/plataforma/pagos/resultado`,
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
      where: { id: pago.id },
      data: {
        mercadoPagoPreferenceId: String(resultado.id),
        initPoint: resultado.init_point,
      },
    });

    return NextResponse.json({
      initPoint: resultado.init_point,
    });
  } catch (error) {
    console.error("Error creando preferencia de Mercado Pago:", error);

    return NextResponse.json(
      { error: "Error al iniciar el pago" },
      { status: 500 }
    );
  }
}