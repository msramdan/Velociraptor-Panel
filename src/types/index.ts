export type IdCloudLocation = {
  display_name: string;
  is_preferred?: boolean;
  is_published?: boolean;
  is_default?: boolean;
  description?: string;
  order_nr: number;
  slug: string;
  country_code: string;
  create_resource_disabled?: boolean;
};

export type UserProfile = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  personal_id_number: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: number;
  lang?: string;
};

export type IdCloudUser = {
  cookie_id?: string;
  id: number;
  name: string;
  last_activity?: string;
  profile?: unknown;
  profile_data: UserProfile | null;
  state?: Record<string, unknown>;
  signup_site?: string;
};

export type VmDisk = {
  created_at: string;
  id?: number;
  name: string;
  pool: string;
  primary: boolean;
  replica: unknown[];
  shared: boolean;
  size: number;
  type: string;
  updated_at?: string | null;
  user_id?: number;
  uuid: string;
};

export type VirtualMachine = {
  backup: boolean;
  billing_account: number;
  created_at: string;
  description: string;
  hostname: string;
  id?: number;
  mac: string;
  memory: number;
  name: string;
  os_name: string;
  os_version: string;
  private_ipv4?: string;
  public_ipv4?: string | null;
  public_ipv6?: string;
  status: string;
  storage: VmDisk[];
  tags?: string[] | null;
  updated_at: string | null;
  user_id: number;
  username: string;
  uuid: string;
  vcpu: number;
  designated_pool_name?: string;
  designated_pool_uuid?: string;
  current_pool_name?: string;
};

export type LocatedVm = VirtualMachine & {
  locationSlug: string;
  locationName: string;
};

export type BillingTotals = {
  credit_amount?: number;
  credit_available?: number;
  discount_amount?: number;
  ongoing?: number;
  subtotal?: number;
  total?: number;
  vat_tax?: number;
  charging_subtotal?: number;
};

export type BillingAccount = {
  id: number;
  title: string;
  email: string;
  credit_amount: number;
  unpaid_amount: number;
  vat_percentage: number;
  is_default: boolean;
  is_active: boolean;
  restriction_level: string;
  status?: string;
  country?: string;
  additional_data?: string;
  running_totals?: BillingTotals;
  precalc_ongoing?: number;
  can_pay?: boolean;
};

export type CreditRecord = {
  id: number;
  amount: number;
  billing_account_id: number;
  created: number;
  description: string;
  reference?: string;
};

export type InvoiceTotals = {
  subtotal?: number;
  discount_amount?: number;
  credit?: number;
  vat_tax?: number;
  total?: number;
};

export type Invoice = {
  id: number;
  padded_id?: string;
  document_number?: string;
  document_type?: string;
  billing_account_id: number;
  created: number;
  due_date: number;
  status: number;
  totals: InvoiceTotals;
};

export type OsVersion = {
  os_version: string;
  display_name: string;
  published: boolean;
};

export type OsImage = {
  os_name: string;
  display_name: string;
  ui_position: number;
  is_default: boolean;
  is_app_catalog: boolean;
  versions: OsVersion[];
};

export type HostPool = {
  uuid: string;
  name: string;
  description?: string;
  is_visible?: boolean;
  is_default_designated?: boolean;
  guest_limits?: {
    cpu?: { min: number; max: number };
    ram_mb?: { min: number; max: number };
    disk_gb?: { min: number; max: number };
  };
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}
