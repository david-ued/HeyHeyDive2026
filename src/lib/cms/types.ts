export type TripDestination =
  | 'ludao'
  | 'lanyu'
  | 'liuqiu'
  | 'kenting'
  | 'other';

export type TripKind = 'padi' | 'aida' | 'experience' | 'other';

export type TripStatus = 'open' | 'sold_out' | 'closed' | 'draft';

export type JsonContent = Record<string, unknown>;

export type Trip = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  destination: TripDestination;
  kind: TripKind;
  start_date: string;
  end_date: string;
  price_twd: number;
  capacity: number;
  available_seats: number;
  short_description: string | null;
  description: string | null;
  description_en: string | null;
  cover_image: string | null;
  content_zh: JsonContent | null;
  content_en: JsonContent | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
};

export type DiveSiteStatus = 'open' | 'closed' | 'draft';

export type DiveSite = {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  region: string | null;
  temp: string | null;
  visibility: string | null;
  intro: string | null;
  intro_en: string | null;
  cover_image: string | null;
  display_order: number;
  content_zh: JsonContent | null;
  content_en: JsonContent | null;
  status: DiveSiteStatus;
  created_at: string;
  updated_at: string;
};

export type CourseSystem = 'aida' | 'padi' | 'other';
export type CourseStatus = 'open' | 'closed' | 'draft';

export type SiteSettings = {
  id: 'default';
  meta_title: string | null;
  meta_title_en: string | null;
  meta_description: string | null;
  meta_description_en: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  updated_at: string;
};

export type Course = {
  id: string;
  slug: string;
  system: CourseSystem;
  level: string;
  title: string;
  title_en: string | null;
  duration: string | null;
  group_size: string | null;
  prerequisite: string | null;
  price_twd: number;
  description: string | null;
  description_en: string | null;
  cover_image: string | null;
  content_zh: JsonContent | null;
  content_en: JsonContent | null;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
};

export type BookingStatus =
  | 'pending'
  | 'contacted'
  | 'confirmed'
  | 'cancelled';

export type BookingItemType = 'trip' | 'course';

export type Booking = {
  id: string;
  item_type: BookingItemType;
  item_id: string;
  item_slug: string;
  item_title_snapshot: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  contact_line: string | null;
  party_size: number;
  notes: string | null;
  status: BookingStatus;
  admin_note: string | null;
  national_id: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  dive_cert_level: string | null;
  dive_cert_number: string | null;
  companions: string[] | null;
  created_at: string;
  updated_at: string;
};
