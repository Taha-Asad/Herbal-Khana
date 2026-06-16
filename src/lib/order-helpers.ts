import { ORDER_STATUS } from "@prisma/client";
import { DisplayAddress, StoredAddress, TrackingEvent } from "@/types/order";

export const STATUS_STEPS: Record<ORDER_STATUS, number> = {
  PENDING: 1,
  PAID: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 0,
  REFUNDED: 0,
};

export const TOTAL_STEPS = 5;

export const emptyAddress: DisplayAddress = {
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Pakistan",
};

export function toDisplayAddress(address: unknown): DisplayAddress {
  if (!address || typeof address !== "object") {
    return { ...emptyAddress };
  }

  const addr = address as StoredAddress;
  return {
    name: addr.name || "",
    phone: addr.phone || "",
    street: addr.line1 + (addr.line2 ? `, ${addr.line2}` : ""),
    city: addr.city || "",
    state: addr.state || undefined,
    postalCode: addr.postal || "",
    country: addr.country || "Pakistan",
  };
}

export function formatTrackingHistory(
  timeline: {
    id: string;
    status: ORDER_STATUS;
    message: string | null;
    createdAt: Date;
  }[],
  currentStatus: ORDER_STATUS
): TrackingEvent[] {
  return timeline.map((event, index) => ({
    id: event.id,
    status: event.status,
    message: event.message,
    timestamp: event.createdAt.toISOString(),
    isCompleted: index < timeline.length - 1 || currentStatus === "DELIVERED",
    isCurrent: index === timeline.length - 1 && currentStatus !== "DELIVERED",
  }));
}
