import { redirect } from "next/navigation";

export const metadata = {
  title: "Plataforma — Sportify",
  description: "Área exclusiva de Sportify.",
};

export default function PaginaPlataforma() {
  redirect("/plataforma/cronograma");
}