import { Badge } from "@/components/ui";

const STATUS_LABEL: Record<
  string,
  { label: string; color: "green" | "amber" | "red" | "slate" | "blue" }
> = {
  PAGO: { label: "Pago", color: "green" },
  PENDENTE: { label: "Pendente", color: "amber" },
  PARCIAL: { label: "Parcial", color: "blue" },
  CANCELADO: { label: "Cancelado", color: "slate" },
};

export function SaleStatusBadge({
  status,
  overdue,
}: {
  status: string;
  overdue?: boolean;
}) {
  if (overdue && (status === "PENDENTE" || status === "PARCIAL")) {
    return <Badge color="red">Atrasado</Badge>;
  }
  const info = STATUS_LABEL[status] ?? { label: status, color: "slate" };
  return <Badge color={info.color}>{info.label}</Badge>;
}

export function PaymentTypeBadge({ type }: { type: string }) {
  return (
    <Badge color={type === "A_VISTA" ? "slate" : "amber"}>
      {type === "A_VISTA" ? "À vista" : "A prazo"}
    </Badge>
  );
}
