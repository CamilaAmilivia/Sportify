type TarjetaEstadisticaProps = {
    titulo: string;
    valor: string;
    icono: string;
    descripcion?: string;
};

export function TarjetaEstadistica({ titulo, valor, icono, descripcion,}: TarjetaEstadisticaProps) {
    return (
        <article
        style={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        }}
        >
        <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
        }}
        >
        <div>
            <p
                style={{
                    color: "var(--color-gray)",
                    fontSize: "0.9rem",
                    marginBottom: 10,
                }}
            >
            {titulo}
            </p>

            <p
                style={{
                    color: "var(--color-dark)",
                    fontSize: "2rem",
                    fontWeight: 800,
                }}
            >
                {valor}
            </p>

            {descripcion && (
            <p
                style={{
                color: "var(--color-gray)",
                fontSize: "0.85rem",
                marginTop: 8,
                }}
            >
                {descripcion}
            </p>
            )}
        </div>

        <div
            style={{
            fontSize: "2.2rem",
            color: "#22c55e",
            }}
        >
            {icono}
        </div>
        </div>
    </article>
    );
}