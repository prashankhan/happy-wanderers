export type BookingStatus = "pending" | "confirmed" | "failed" | "expired" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "unpaid";

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-600",
};

const paymentStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-600",
  unpaid: "bg-amber-100 text-amber-800",
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const style = statusStyles[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const style = paymentStyles[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
