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
  "timimoun": 49, "timimoune": 49,
  "bordj badji mokhtar": 50, "bordj baji mokhtar": 50,
  "ouled djellal": 51,
  "beni abbes": 52, "beni abbas": 52,
  "in salah": 53, "ain salah": 53,
  "in guezzam": 54, "ain guezzam": 54,
  "touggourt": 55,
  "djanet": 56,
  "el mghair": 57, "el m'ghair": 57,
  "el meniaa": 58, "el menia": 58,
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

  const DEFAULT_COMMUNES: Record<number, string> = {
    16: "ALGER CENTRE",
    34: "BORDJ BOU ARRERIDJ",
    36: "EL TARF",
    49: "TIMIMOUN",
    52: "BENI ABBES",
    53: "IN SALAH",
    11: "TAMANGHASSET",
    57: "EL M GHAIR"
  };
  const fallbackCommune = DEFAULT_COMMUNES[wilayaId] || input.wilaya.toUpperCase();

  const WILAYA_PRICES: Record<number, { home: number; desk: number }> = {
    16: { home: 400, desk: 250 }, 9: { home: 600, desk: 300 }, 35: { home: 600, desk: 300 },
    42: { home: 600, desk: 300 }, 10: { home: 630, desk: 300 }, 26: { home: 630, desk: 300 },
    15: { home: 630, desk: 300 }, 2: { home: 720, desk: 300 }, 23: { home: 720, desk: 300 },
    34: { home: 720, desk: 300 }, 6: { home: 720, desk: 300 }, 21: { home: 720, desk: 300 },
    31: { home: 720, desk: 300 }, 43: { home: 720, desk: 0 }, 25: { home: 720, desk: 300 },
    46: { home: 720, desk: 300 }, 13: { home: 720, desk: 300 }, 22: { home: 720, desk: 300 },
    48: { home: 720, desk: 300 }, 28: { home: 720, desk: 300 }, 29: { home: 720, desk: 300 },
    5: { home: 720, desk: 300 }, 44: { home: 720, desk: 300 }, 38: { home: 720, desk: 0 },
    19: { home: 720, desk: 300 }, 4: { home: 720, desk: 300 }, 27: { home: 720, desk: 300 },
    18: { home: 770, desk: 300 }, 40: { home: 810, desk: 300 }, 14: { home: 810, desk: 300 },
    20: { home: 810, desk: 300 }, 24: { home: 810, desk: 300 }, 41: { home: 810, desk: 300 },
    36: { home: 810, desk: 0 }, 12: { home: 810, desk: 300 }, 3: { home: 900, desk: 430 },
    7: { home: 900, desk: 430 }, 17: { home: 900, desk: 430 }, 51: { home: 900, desk: 0 },
    58: { home: 990, desk: 430 }, 39: { home: 990, desk: 0 }, 30: { home: 990, desk: 430 },
    55: { home: 990, desk: 430 }, 57: { home: 990, desk: 0 }, 47: { home: 990, desk: 430 },
    8: { home: 1080, desk: 510 }, 45: { home: 1080, desk: 510 }, 52: { home: 1080, desk: 0 },
    32: { home: 1080, desk: 0 }, 37: { home: 1350, desk: 0 }, 1: { home: 1350, desk: 600 },
    49: { home: 1350, desk: 0 }, 53: { home: 1530, desk: 770 }, 11: { home: 1620, desk: 850 },
    33: { home: 1800, desk: 850 }
  };

  const deliveryPrices = WILAYA_PRICES[wilayaId] || { home: 600, desk: 400 };
  const realFraisDeLivraison = input.stopDesk ? deliveryPrices.desk : deliveryPrices.home;

  // To prevent pipe (|) array length mismatches or 100-char truncation bugs, we summarize products into a single item.
  // The detailed breakdown is still sent in the 'remarque' field for the courier.
  const productNames = "Articles E-commerce";
  const totalDZD = Math.round(input.totalPrice);
  const productPrices = String(totalDZD);

  // remarque = full order summary the courier reads when calling the client. 
  // Use commas instead of \n to avoid URL encoding issues in older PHP backends.
  const itemsSummary = input.products
    .map(p => `${p.name}`)  
    .join(", ");
  const fullRemarque = [
    `Cmd #${input.orderId}`,
    `Client: ${input.firstName || "Client"} ${input.lastName || "Client"}`,
    `Tel: ${input.phone}`,
    `Adr: ${input.address || input.wilaya}`,
    `Articles: ${itemsSummary}`,
    `Total: ${totalDZD} DA + ${realFraisDeLivraison} DA (livraison)`,
    input.remarque ? `Note: ${input.remarque}` : "Fragile",
  ].join(" | ").substring(0, 255);

  const cleanPhone = (input.phone || "0550000000").replace(/\D/g, '').substring(0, 20);

  const params = new URLSearchParams({
    apiKey: ELOGISTIA_API_KEY,
    name: (input.lastName || "Client").substring(0, 100),
    firstname: (input.firstName || "Client").substring(0, 100),
    mail: (input.email || "client@store.dz").substring(0, 100),
    phone: cleanPhone,
    address: (input.address || input.wilaya || "Adresse").substring(0, 255),
    commune: fallbackCommune.substring(0, 100),
    wilaya: String(wilayaId),
    product: productNames,
    price: productPrices,
    fraisDeLivraison: String(realFraisDeLivraison),
    remarque: fullRemarque,
    stop_desk: input.stopDesk ? "2" : "1",           // 1 = home delivery, 2 = stop desk
    modeDeLivraison: "1",     // 1 = normal delivery, 4 = exchange
    IdCommande: input.orderId,
    poids: "1",               // ~1kg for perfume
  });

  const url = `${ELOGISTIA_BASE_URL}/insertCommande/?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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

    // Error response: Elogistia returns { "Message": "Cette commune n'existe pas" }
    return {
      success: false,
      error: data?.Message ?? data?.message ?? data?.error ?? JSON.stringify(data).substring(0, 200),
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
