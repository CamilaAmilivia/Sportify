import { format } from "date-fns";

// Coordenadas fijas (ajustar según la ubicación real del gimnasio)
const LATITUD = -34.6037;
const LONGITUD = -58.3816;

const ICONO_POR_CODIGO: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌦️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "❄️",
  73: "❄️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "🌧️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

export type PronosticoDia = {
  icono: string;
  temperaturaMax: number;
};

export async function obtenerPronosticoSemana(
  inicio: Date,
  fin: Date
): Promise<Record<string, PronosticoDia>> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LATITUD}&longitude=${LONGITUD}` +
      `&daily=weathercode,temperature_2m_max` +
      `&timezone=America%2FArgentina%2FBuenos_Aires` +
      `&start_date=${format(inicio, "yyyy-MM-dd")}` +
      `&end_date=${format(fin, "yyyy-MM-dd")}`;

    const respuesta = await fetch(url, { next: { revalidate: 3600 } });

    if (!respuesta.ok) {
      return {};
    }

    const datos = await respuesta.json();
    const fechas: string[] = datos?.daily?.time ?? [];
    const codigos: number[] = datos?.daily?.weathercode ?? [];
    const temperaturas: number[] = datos?.daily?.temperature_2m_max ?? [];

    const pronostico: Record<string, PronosticoDia> = {};

    fechas.forEach((fecha, i) => {
      pronostico[fecha] = {
        icono: ICONO_POR_CODIGO[codigos[i]] ?? "",
        temperaturaMax: Math.round(temperaturas[i]),
      };
    });

    return pronostico;
  } catch {
    return {};
  }
}
