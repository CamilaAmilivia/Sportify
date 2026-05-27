import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  esMismoDiaYHorario,
  obtenerFinDeMes,
  TIPOS_PAGO,
} from "@/lib/pagos";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const paymentId = body?.data?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      return NextResponse.json({ ok: true });
    }

    const payment = await paymentResponse.json();

    const externalReference = payment.external_reference;
    const status = payment.status;

    if (!externalReference) {
      return NextResponse.json({ ok: true });
    }

    const pago = await prisma.pago.findUnique({
      where: {
        externalReference,
      },
    });

    if (!pago) {
      return NextResponse.json({ ok: true });
    }

    if (status !== "approved") {
      await prisma.pago.update({
        where: {
          id: pago.id,
        },
        data: {
          estado: status === "rejected" ? "RECHAZADO" : "PENDIENTE",
          mercadoPagoPaymentId: String(paymentId),
        },
      });

      return NextResponse.json({ ok: true });
    }

    await prisma.$transaction(async (tx) => {
      const pagoActual = await tx.pago.findUnique({
        where: {
          id: pago.id,
        },
      });

      if (!pagoActual) {
        return;
      }

      if (pagoActual.estado === "APROBADO") {
        return;
      }

      if (!pagoActual.claseId) {
        return;
      }

      const clase = await tx.clase.findUnique({
        where: {
          id: pagoActual.claseId,
        },
      });

      if (!clase) {
        return;
      }

      if (pagoActual.tipo === TIPOS_PAGO.MENSUALIDAD) {
        const finDeMes = obtenerFinDeMes(clase.fechaHora);

        const clasesDelMes = await tx.clase.findMany({
          where: {
            estado: "ACTIVA",
            disciplinaId: clase.disciplinaId,
            fechaHora: {
              gte: clase.fechaHora,
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

        for (const claseDelMes of clasesMismoDiaYHorario) {
          const yaInscripto = await tx.inscripcion.findUnique({
            where: {
              usuarioId_claseId: {
                usuarioId: pagoActual.usuarioId,
                claseId: claseDelMes.id,
              },
            },
          });

          if (yaInscripto) {
            continue;
          }

          const inscriptos = await tx.inscripcion.count({
            where: {
              claseId: claseDelMes.id,
              estado: "ACTIVA",
            },
          });

          if (inscriptos >= claseDelMes.cupoMaximo) {
            const yaEnListaEspera = await tx.listaEspera.findUnique({
              where: {
                usuarioId_claseId: {
                  usuarioId: pagoActual.usuarioId,
                  claseId: claseDelMes.id,
                },
              },
            });

            if (!yaEnListaEspera) {
              const ultimaPosicion = await tx.listaEspera.aggregate({
                where: {
                  claseId: claseDelMes.id,
                },
                _max: {
                  posicion: true,
                },
              });

              const proximaPosicion =
                (ultimaPosicion._max.posicion ?? 0) + 1;

            await tx.listaEspera.create({
              data: {
                usuarioId: pagoActual.usuarioId,
                claseId: claseDelMes.id,
                pagoId: pagoActual.id,
                tipo: "ABONADO",
                prioridad: 1,
                posicion: proximaPosicion,
              },
            });
            }

            continue;
          }

          await tx.inscripcion.create({
            data: {
              usuarioId: pagoActual.usuarioId,
              claseId: claseDelMes.id,
              estado: "ACTIVA",
              pagoId: pagoActual.id,
            },
          });
        }

        await tx.pago.update({
          where: {
            id: pagoActual.id,
          },
          data: {
            estado: "APROBADO",
            mercadoPagoPaymentId: String(paymentId),
          },
        });

        return;
      }

      const inscripcionExistente = await tx.inscripcion.findUnique({
        where: {
          usuarioId_claseId: {
            usuarioId: pagoActual.usuarioId,
            claseId: pagoActual.claseId,
          },
        },
      });

      if (inscripcionExistente) {
        await tx.pago.update({
          where: {
            id: pagoActual.id,
          },
          data: {
            estado: "APROBADO",
            mercadoPagoPaymentId: String(paymentId),
          },
        });

        return;
      }

      const inscriptos = await tx.inscripcion.count({
        where: {
          claseId: clase.id,
          estado: "ACTIVA",
        },
      });

      if (inscriptos >= clase.cupoMaximo) {
        await tx.pago.update({
          where: {
            id: pagoActual.id,
          },
          data: {
            estado: "CANCELADO",
            mercadoPagoPaymentId: String(paymentId),
          },
        });

        return;
      }

      await tx.inscripcion.create({
        data: {
          usuarioId: pagoActual.usuarioId,
          claseId: pagoActual.claseId,
          estado: "ACTIVA",
          pagoId: pagoActual.id,
        },
      });

      await tx.pago.update({
        where: {
          id: pagoActual.id,
        },
        data: {
          estado: "APROBADO",
          mercadoPagoPaymentId: String(paymentId),
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error procesando webhook de Mercado Pago:", error);

    return NextResponse.json({ ok: true });
  }
}