export interface MerchantProfile {
  id: string;
  name: string;
  storeDomain: string;
  category: string;
  productCategories: string[];
  defaultThreshold: number;
  defaultDiscount: number;
  avatar: string;
  badgeColor: string;
  description: string;
  isJudge?: boolean;
}

export const MERCHANT_PROFILES: Record<string, MerchantProfile> = {
  urban_vogue: {
    id: "urban_vogue",
    name: "Urban Vogue India",
    storeDomain: "urbanvogue.in",
    category: "Fashion & Apparel",
    productCategories: ["apparel", "clothing", "fashion", "accessories"],
    defaultThreshold: 0.42,
    defaultDiscount: 5,
    avatar: "👗",
    badgeColor: "border-pink-500/30 text-pink-300 bg-pink-500/10",
    description: "D2C fashion & ethnic apparel. Focuses on curbing impulse COD orders in Tier 2 & Tier 3 cities.",
  },
  kicks_india: {
    id: "kicks_india",
    name: "KicksIndia Footwear",
    storeDomain: "kicksindia.co",
    category: "Streetwear & Footwear",
    productCategories: ["footwear", "shoes", "sneakers"],
    defaultThreshold: 0.38,
    defaultDiscount: 8,
    avatar: "👟",
    badgeColor: "border-orange-500/30 text-orange-300 bg-orange-500/10",
    description: "High-volume streetwear sneakers. Uses an aggressive threshold to prevent expensive courier returns.",
  },
  aura_electronics: {
    id: "aura_electronics",
    name: "Aura Electronics",
    storeDomain: "auraaudio.tech",
    category: "Audio & Consumer Tech",
    productCategories: ["electronics", "audio", "gadgets"],
    defaultThreshold: 0.48,
    defaultDiscount: 5,
    avatar: "⚡",
    badgeColor: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
    description: "Premium sound systems & wearables. High AOV requires conservative nudging to preserve margins.",
  },
  judge_master: {
    id: "judge_master",
    name: "Hackathon Judge (Master View)",
    storeDomain: "judge.razorpay.build",
    category: "All Merchant Accounts (Cross-Store Evaluation)",
    productCategories: [],
    defaultThreshold: 0.4467, // F1-optimal held-out baseline
    defaultDiscount: 5,
    avatar: "⚖️",
    badgeColor: "border-amber-500/40 text-amber-300 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    description: "Master evaluator view. Cross-account order monitoring, multi-store comparison, and model benchmarking.",
    isJudge: true,
  },
};

export interface AccountSettings {
  threshold: number;
  discount: number;
  storeName?: string;
  storeDomain?: string;
  razorpayKeyId?: string;
  razorpayWebhookSecret?: string;
}

export function getCurrentUser(): MerchantProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sentinelx_current_merchant");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const profile = MERCHANT_PROFILES[parsed.id] || parsed;
    const settings = getAccountSettings(profile.id);
    return {
      ...profile,
      defaultThreshold: settings.threshold,
      defaultDiscount: settings.discount,
      name: settings.storeName || profile.name,
      storeDomain: settings.storeDomain || profile.storeDomain,
    };
  } catch {
    return null;
  }
}

export function setCurrentUser(profile: MerchantProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "sentinelx_current_merchant",
    JSON.stringify({
      id: profile.id,
      name: profile.name,
      isJudge: !!profile.isJudge,
    })
  );
  // Dispatch custom event so listeners update immediately
  window.dispatchEvent(new Event("sentinelx_auth_changed"));
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("sentinelx_current_merchant");
  window.dispatchEvent(new Event("sentinelx_auth_changed"));
}

export function getAccountSettings(merchantId: string): AccountSettings {
  const p = MERCHANT_PROFILES[merchantId] || MERCHANT_PROFILES.urban_vogue;
  if (typeof window === "undefined") {
    return { threshold: p.defaultThreshold, discount: p.defaultDiscount };
  }
  try {
    const raw = localStorage.getItem(`sentinelx_settings_${merchantId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { threshold: p.defaultThreshold, discount: p.defaultDiscount };
}

export function saveAccountSettings(merchantId: string, settings: AccountSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`sentinelx_settings_${merchantId}`, JSON.stringify(settings));
  window.dispatchEvent(new Event("sentinelx_auth_changed"));
}

export function getMerchantForOrder(order: { product_category?: string; id?: string }): MerchantProfile {
  const cat = (order.product_category || "").toLowerCase();
  if (cat.includes("footwear") || cat.includes("shoe")) {
    return MERCHANT_PROFILES.kicks_india;
  }
  if (cat.includes("electronic") || cat.includes("audio") || cat.includes("gadget")) {
    return MERCHANT_PROFILES.aura_electronics;
  }
  if (order.id) {
    const charCode = order.id.charCodeAt(0);
    if (charCode % 3 === 0) return MERCHANT_PROFILES.kicks_india;
    if (charCode % 3 === 1) return MERCHANT_PROFILES.aura_electronics;
  }
  return MERCHANT_PROFILES.urban_vogue;
}
