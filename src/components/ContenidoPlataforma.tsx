type ContenidoPlataformaProps = {
    children: React.ReactNode;
};

export function ContenidoPlataforma({ children }: ContenidoPlataformaProps) {
    return (
    <main
        style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "48px 28px",
        }}
    >
        {children}
    </main>
    );
}