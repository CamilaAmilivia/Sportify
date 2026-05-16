type TituloPaginaProps = {
    titulo: string;
    descripcion?: string;
};

export function TituloPagina({ titulo, descripcion }: TituloPaginaProps) {
    return (
        <div style={{ marginBottom: 32 }}>
        <h1
            style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--color-dark)",
            marginBottom: descripcion ? 8 : 0,
            }}
        >
        {titulo}
        </h1>

        {descripcion && (
            <p
            style={{
                color: "var(--color-gray)",
                fontSize: "1rem",
            }}
            >
            {descripcion}
        </p>
        )}
    </div>
    );
}