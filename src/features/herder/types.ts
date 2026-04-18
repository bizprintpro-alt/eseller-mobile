/**
 * API contract for the Malchnaas (direct-from-herder) marketplace.
 * Mirrors the `/api/herder/*` endpoints served by the backend.
 * Monetary values are integer MNT — no currency conversion on mobile.
 */

export interface HerderSummary {
  id?:          string;      // herder user / shop id — enables profile link
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
  herderId?: string;
  limit?:    number;
  page?:     number;
}

/**
 * Public herder profile — what a buyer sees when they tap through from a
 * product. Fields beyond HerderSummary are optional until backend ships them.
 */
export interface HerderProfile extends HerderSummary {
  id:             string;
  bio?:           string;
  joinedAt?:      string;           // ISO date
  livestock?:     LivestockCounts;
  coverImage?:    string;
  avatar?:        string;
  stats?: {
    deliverySuccessRate?: number;   // 0-1
    onTimeRate?:          number;   // 0-1
    productCount?:        number;
  };
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

/**
 * Herder's own products (seller view) — backend returns the raw Mongoose
 * document so it includes `isActive` and denormalized `province` that the
 * public list strips away.
 */
export interface MyHerderProduct extends HerderProduct {
  isActive: boolean;
  province: string;
  soldCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MyProductsResponse {
  products: MyHerderProduct[];
  total:    number;
  page:     number;
  pages:    number;
}

export interface ProductWritable {
  name:              string;
  description?:      string;
  price:             number;
  salePrice?:        number | null;
  category:          string;
  images?:           string[];
  stock?:            number;
  requiresColdChain?: boolean;
}

export type HerderOrderStatus =
  | 'pending' | 'confirmed' | 'preparing'
  | 'shipped' | 'delivered' | 'cancelled';

export interface MyHerderOrder {
  _id:           string;
  orderNumber:   string;
  buyer?:        { _id: string; name: string; phone?: string } | null;
  items: Array<{
    product:  string;
    name:     string;
    price:    number;
    quantity: number;
    subtotal: number;
  }>;
  subtotal:    number;
  deliveryFee: number;
  total:       number;
  status:      HerderOrderStatus;
  payment: {
    method: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    paidAt?: string;
  };
  delivery: {
    address?: { province?: string; district?: string; street?: string; note?: string };
    phone?: string;
    receiver?: string;
    requiresColdChain?: boolean;
    shippedAt?: string;
    deliveredAt?: string;
  };
  createdAt:   string;
  updatedAt:   string;
}

export interface MyOrdersResponse {
  orders: MyHerderOrder[];
  total:  number;
  page:   number;
  pages:  number;
}

export interface EarningsSummary {
  released:      { total: number; count: number };  // хүлээн авсан
  held:          { total: number; count: number };  // escrow-д
  pending:       { total: number; count: number };  // pay-аагүй
  recentPayouts: Array<{
    _id:         string;
    orderNumber: string;
    total:       number;
    escrow:      { holdAmount: number; releasedAt: string };
  }>;
  commissionRate: number;
}
