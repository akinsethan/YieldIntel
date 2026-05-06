export type ProductType = "FIA" | "MYGA" | "RILA" | "SPIA" | "DIA";

export interface Carrier {
  id: string;
  name: string;
  am_best_rating: string | null;
  sp_rating: string | null;
  moodys_rating: string | null;
  states_available: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  carrier_id: string;
  name: string;
  type: ProductType;
  surrender_years: number | null;
  min_premium: number | null;
  states_available: string[] | null;
  is_active: boolean;
  bonus: number | null;
  mva: boolean | null;
  surrender_schedule: number[] | null;
  renewal_type: "Declared Rate" | "Indexed Option" | "Par Rate" | null;
  notes: string | null;
  buffer_rate: number | null;
  created_at: string;
  updated_at: string;
  carrier?: Carrier;
}

export interface Rate {
  id: string;
  product_id: string;
  index_name: string;
  cap_rate: number | null;
  par_rate: number | null;
  spread: number | null;
  effective_date: string;
  expiration_date: string | null;
  is_current: boolean;
  updated_by: string | null;
  created_at: string;
  product?: Product & { carrier?: Carrier };
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface RateTableRow {
  rate_id: string;
  carrier_name: string;
  am_best_rating: string | null;
  product_name: string;
  product_type: ProductType;
  surrender_years: number | null;
  index_name: string;
  cap_rate: number | null;
  par_rate: number | null;
  spread: number | null;
  min_premium: number | null;
  effective_date: string;
  states_available: string[] | null;
}
