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

export interface LivestockCounts {
  horse?:  number;
  cow?:    number;
  sheep?:  number;
  goat?:   number;
  camel?:  number;
}

export interface HerderRegisterPayload {
  firstName:       string;
  lastName:        string;
  registerNumber:  string;        // Mongolian national ID, 10 chars
  phone:           string;
  province:        string;        // aimag code
  district:        string;        // sum / bag name
  livestock:       LivestockCounts;
  aDansNumber?:    string;        // livestock registry id (А данс)
  vetCertUri?:     string;        // local file uri of uploaded vet cert image
  bankName:        string;
  bankAccount:     string;
  gps?:            { latitude: number; longitude: number };
  notes?:          string;
}

export interface HerderRegisterResponse {
  success: boolean;
  message?: string;
  applicationId?: string;
}
