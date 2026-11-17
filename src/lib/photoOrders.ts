import { supabase } from "@/lib/supabaseServer";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PhotoOrder {
  id: string;
  event_id: number;
  mode: "package" | "individual";
  photo_ids: string[];
  amount: number | string;
  status: string;
  payment_id: string | null;
  paid_at: string | null;
}

export function mercadoPagoToken() {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim() || "";
}

export async function getOrder(orderId: string): Promise<PhotoOrder | null> {
  if (!UUID_RE.test(orderId)) return null;
  const { data, error } = await supabase.from("photo_orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw error;
  return (data as PhotoOrder) || null;
}

async function nextId(table: string): Promise<number> {
  const { data } = await supabase.from(table).select("id").order("id", { ascending: false }).limit(1);
  return data && data.length > 0 ? Number(data[0].id) + 1 : 1;
}

/** Writes the financial transaction and the admin notification for a paid order. */
async function recordSale(order: PhotoOrder, paymentId: string) {
  const { data: event } = await supabase
    .from("event_medias")
    .select("name, photos")
    .eq("id", order.event_id)
    .maybeSingle();
  const eventName = event?.name || `Evento ${order.event_id}`;
  const count =
    order.mode === "package"
      ? Array.isArray(event?.photos) ? event!.photos.length : 0
      : Array.isArray(order.photo_ids) ? order.photo_ids.length : 0;
  const value = Number(order.amount);

  try {
    await supabase.from("transactions").insert({
      id: await nextId("transactions"),
      type: "Receita",
      category: "Galeria de Fotos",
      value,
      date: new Date().toISOString().split("T")[0],
      description: `Compra de fotos via Mercado Pago - Evento ${eventName} (${count} fotos) #${paymentId}`,
      status: "Pago",
      customer: `Cliente - Evento ${eventName}`,
    });
  } catch (err) {
    console.error("Could not record sale transaction:", err);
  }

  try {
    await supabase.from("notifications").insert({
      id: await nextId("notifications"),
      title: "Compra Aprovada via Mercado Pago",
      description: `Faturamento de R$ ${value.toLocaleString("pt-BR")} confirmado para o evento '${eventName}'.`,
      time: "Agora mesmo",
      unread: true,
      type: "payment",
    });
  } catch (err) {
    console.error("Could not record sale notification:", err);
  }
}

/**
 * Confirms a payment directly with Mercado Pago (never trusts the browser) and,
 * if it is approved for the right amount, marks the matching order as paid.
 * Idempotent: the sale is recorded only once, even with webhook + redirect racing.
 */
export async function syncPayment(
  paymentId: string,
  expectedOrderId?: string
): Promise<{ orderId: string | null; mpStatus: string; paid: boolean }> {
  const token = mercadoPagoToken();
  if (!token || !/^\d{3,20}$/.test(paymentId)) return { orderId: null, mpStatus: "invalid", paid: false };

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { orderId: null, mpStatus: `mp_${res.status}`, paid: false };

  const payment = await res.json();
  const orderId = String(payment.external_reference || "");
  if (!UUID_RE.test(orderId)) return { orderId: null, mpStatus: String(payment.status), paid: false };
  if (expectedOrderId && orderId.toLowerCase() !== expectedOrderId.toLowerCase()) {
    return { orderId: null, mpStatus: "order_mismatch", paid: false };
  }

  const order = await getOrder(orderId);
  if (!order) return { orderId: null, mpStatus: "order_not_found", paid: false };
  if (order.status === "paid") return { orderId, mpStatus: String(payment.status), paid: true };

  const amountOk =
    Number(payment.transaction_amount) + 0.009 >= Number(order.amount) &&
    String(payment.currency_id || "BRL") === "BRL";

  if (payment.status !== "approved" || !amountOk) {
    return { orderId, mpStatus: String(payment.status), paid: false };
  }

  // Claim the order atomically: only the call that flips pending -> paid records the sale.
  const { data: claimed, error } = await supabase
    .from("photo_orders")
    .update({ status: "paid", payment_id: paymentId, paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .neq("status", "paid")
    .select("*");
  if (error) throw error;

  if (claimed && claimed.length > 0) {
    await recordSale(claimed[0] as PhotoOrder, paymentId);
  }
  return { orderId, mpStatus: "approved", paid: true };
}
