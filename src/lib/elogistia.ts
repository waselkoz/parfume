// ==============================================================================
// src/lib/elogistia.ts
// Elogistia Delivery API Client — SERVER-SIDE ONLY
// Never import this file in client components.
// Docs: https://documenter.getpostman.com/view/21600448/2s8YzP14j2
// ==============================================================================

const ELOGISTIA_BASE_URL = "https://api.elogistia.com";
const ELOGISTIA_API_KEY = process.env.DELV_API || "";

// ==============================================================================
// WILAYA NAME → ELOGISTIA WILAYA ID MAP
// Source: GET /getWilayas/ response from Elogistia
// ==============================================================================
const WILAYA_MAP: Record<string, number> = {
  // Common name variants a customer might type → Elogistia ID
  "adrar": 1,
  "chlef": 2,
  "laghouat": 3,
  "oum el bouaghi": 4, "oum-el-bouaghi": 4, "oum bouaghi": 4,
  "batna": 5,
  "bejaia": 6, "béjaïa": 6,
  "biskra": 7,
  "bechar": 8, "béchar": 8,
  "blida": 9,
  "bouira": 10,
  "tamanrasset": 11,
  "tebessa": 12, "tébessa": 12,
  "tlemcen": 13,
  "tiaret": 14,
  "tizi ouzou": 15, "tizi-ouzou": 15,
  "alger": 16, "algiers": 16, "alger centre": 16,
  "djelfa": 17,
  "jijel": 18,
  "setif": 19, "sétif": 19,
  "saida": 20, "saïda": 20,
  "skikda": 21,
  "sidi bel abbes": 22, "sidi bel abbès": 22, "sidi-bel-abbes": 22,
  "annaba": 23,
  "guelma": 24,
  "constantine": 25,
  "medea": 26, "médéa": 26,
  "mostaganem": 27,
  "msila": 28, "m'sila": 28,
  "mascara": 29,
  "ouargla": 30,
  "oran": 31,
  "el bayadh": 32,
  "illizi": 33,
  "bordj bou arraridj": 34, "bordj": 34,
  "boumerdes": 35, "boumerdès": 35,
  "el taref": 36, "el-taref": 36,
  "tindouf": 37,
  "tissemsilt": 38,
  "el oued": 39, "eloued": 39,
  "khenchela": 40,
  "souk ahras": 41, "souk-ahras": 41,
  "tipaza": 42, "tipasa": 42,
  "mila": 43,
  "ain defla": 44, "aïn defla": 44,
  "naama": 45, "naâma": 45,
  "ain temouchent": 46, "aïn témouchent": 46,
  "ghardaia": 47, "ghardaïa": 47,
  "relizane": 48,
};

/**
 * Converts a wilaya name string (from the order form) to an Elogistia wilaya ID.
 * Falls back to 16 (Alger) if not found.
 */
function wilayaNameToId(wilayaName: string): number {
  const normalized = wilayaName.toLowerCase().trim();
  return WILAYA_MAP[normalized] ?? 16; // Default to Alger
}

// ==============================================================================
// Elogistia Order Delivery Status values
// ==============================================================================
export type ElogistiaStatus =
  | "not_dispatched"
  | "pending_sync"
  | "dispatched"
  | "ramassee"
  | "en_transit"
  | "en_livraison"
  | "livre"
  | "retour"
  | "annulee"
  | "perdue"
  | "suspendue";

/**
 * Maps Elogistia French status strings to our internal delivery_status values.
 */
export function mapElogistiaStatus(statut: string): ElogistiaStatus {
  const s = statut?.toLowerCase() ?? "";
  if (s.includes("livrée") || s.includes("livré") || s.includes("livrée & réglée")) return "livre";
  if (s.includes("en cours livraison") || s.includes("en livraison") || s.includes("en cours de livraison")) return "en_livraison";
  if (s.includes("en transit") || s.includes("à expédiée") || s.includes("en hub") || s.includes("réceptionnée")) return "en_transit";
  if (s.includes("ramassée") || s.includes("ramassée") || s.includes("en cours de ramassage")) return "ramassee";
  if (s.includes("retour")) return "retour";
  if (s.includes("annulée") || s.includes("annulee")) return "annulee";
  if (s.includes("perdue")) return "perdue";
  if (s.includes("suspendue")) return "suspendue";
  return "dispatched"; // default — order is at Elogistia but no meaningful status yet
}

// ==============================================================================
// INSERT COMMANDE
// POST https://api.elogistia.com/insertCommande/?apiKey=...&name=...
// Returns: { "success": "L-214DMUF", "Frais de livraison": 1000, "Poids": 20, ... }
// ==============================================================================

export interface DispatchOrderInput {
  orderId: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  address: string;
  commune: string;
  wilaya: string;
  products: Array<{ name: string; price: number }>;
  totalPrice: number; // in EUR (we convert to DZD)
  remarque?: string;
  stopDesk?: boolean;
}

type DispatchOrderResult =
  | { success: true; trackingId: string; fraisLivraison: number }
  | { success: false; error: string };

export async function dispatchOrderToElogistia(
  input: DispatchOrderInput
): Promise<{ success: true; trackingId: string; fraisLivraison: number } | { success: false; error: string }> {
  if (!ELOGISTIA_API_KEY) {
    return { success: false, error: "DELV_API key not configured" };
  }

  const wilayaId = wilayaNameToId(input.wilaya);

  // Products: pipe-separated — include name + size + qty so courier knows what was ordered
  const productNames = input.products.map(p => p.name).join("|");
  // Prices in DZD (multiply EUR price × 148)
  const productPrices = input.products.map(p => Math.round(p.price * 148)).join("|");
  const totalDZD = Math.round(input.totalPrice * 148);

  // remarque = full order summary the courier reads when calling the client
  const itemsSummary = input.products
    .map(p => `• ${p.name}`)  
    .join("\n");
  const fullRemarque = [
    `Commande #${input.orderId}`,
    `Client: ${input.firstName} ${input.lastName}`,
    `Tel: ${input.phone}`,
    `Adresse: ${input.commune}, ${input.wilaya}`,
    `Articles:`,
    itemsSummary,
    `Total: ${totalDZD} DZD`,
    input.remarque ? `Note: ${input.remarque}` : "Parfum — fragile, manipuler avec soin",
  ].join(" | ").substring(0, 255);

  const params = new URLSearchParams({
    apiKey: ELOGISTIA_API_KEY,
    name: input.lastName.substring(0, 100),
    firstname: input.firstName.substring(0, 100),
    mail: (input.email || "").substring(0, 100),
    phone: input.phone.substring(0, 100),
    address: (input.address || input.commune || "").substring(0, 255),
    commune: input.commune.toUpperCase().substring(0, 100),
    wilaya: String(wilayaId),
    product: productNames.substring(0, 100),
    price: productPrices.substring(0, 100),
    fraisDeLivraison: String(totalDZD),
    remarque: fullRemarque,
    stop_desk: input.stopDesk ? "2" : "1",           // 1 = home delivery, 2 = stop desk
    modeDeLivraison: "1",     // 1 = normal delivery, 4 = exchange
    IdCommande: input.orderId,
    poids: "1",               // ~1kg for perfume
  });

  const url = `${ELOGISTIA_BASE_URL}/insertCommande/?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
      // Elogistia uses query params, no body needed for POST
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Elogistia HTTP ${response.status}: ${text.substring(0, 200)}` };
    }

    const data = await response.json();

    // Success response: { "success": "L-214DMUF", "Frais de livraison": 1000, ... }
    if (data?.success && typeof data.success === "string") {
      return {
        success: true,
        trackingId: data.success,
        fraisLivraison: data["Frais de livraison"] ?? 0,
      };
    }

    // Error response: { "error": "..." } or unexpected shape
    return {
      success: false,
      error: data?.error ?? data?.message ?? JSON.stringify(data).substring(0, 200),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Network error: ${message}` };
  }
}

// ==============================================================================
// GET TRACKING
// GET https://api.elogistia.com/getTracking/?apiKey=...&tracking=ELO-XXX
// Returns: { "body": [{ "Statut": "En livraison", "Date": "...", "Tracking": "...", "logID": "..." }], "itemCount": 1 }
// ==============================================================================

export interface TrackingEntry {
  statut: string;
  date: string;
  tracking: string;
  logId: string;
}

export async function getOrderTracking(
  trackingId: string
): Promise<{ success: true; entries: TrackingEntry[]; latestStatus: ElogistiaStatus } | { success: false; error: string }> {
  if (!ELOGISTIA_API_KEY) {
    return { success: false, error: "DELV_API key not configured" };
  }

  const params = new URLSearchParams({
    apiKey: ELOGISTIA_API_KEY,
    tracking: trackingId,
  });

  const url = `${ELOGISTIA_BASE_URL}/getTracking/?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      return { success: false, error: `Elogistia HTTP ${response.status}` };
    }

    const data = await response.json();

    if (!data?.body || !Array.isArray(data.body)) {
      return { success: false, error: "Unexpected tracking response format" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: TrackingEntry[] = data.body.map((item: any) => ({
      statut: item["Statut"] ?? "",
      date: item["Date"] ?? "",
      tracking: item["Tracking"] ?? trackingId,
      logId: item["logID"] ?? "",
    }));

    // Latest status is the first entry (most recent)
    const latestStatut = entries[0]?.statut ?? "";
    const latestStatus = mapElogistiaStatus(latestStatut);

    return { success: true, entries, latestStatus };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Network error: ${message}` };
  }
}
