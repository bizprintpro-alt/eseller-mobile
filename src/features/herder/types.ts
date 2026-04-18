/**
 * API contract for the Malchnaas (direct-from-herder) marketplace.
 * Mirrors the `/api/herder/*` endpoints served by the backend.
 * Monetary values are integer MNT — no currency conversion on mobile.
 */

export interface HerderSummary {
  herderName:   string;
  province:     string;      // code — e.g. "TOV"
  provinceName: string;      // localized — e.g. "Төв"
  district:     string;      // sum / district name
  isVerified:   boolean;
  rating?:      number;      // 0-5 (optional until backend ships it)
  orderCount?:  number;
}

export interface HerderProduct {
  id:         string;
  name:       string;
  price:      number;                    // integer MNT
  salePrice?: number | null;             // integer MNT
  images:     string[];
  category?:  string | null;
  herder?:    HerderSummary | null;
  requiresColdChain?: boolean;
  description?: string;
  stock?:     number;
}

export interface HerderListResponse {
  products: HerderProduct[];
  pages:    number;
  total?:   number;
}

export interface HerderListParams {
  province?: string;
  category?: string;
  limit?:    number;
  page?:     number;
}
