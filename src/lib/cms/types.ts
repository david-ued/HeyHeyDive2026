export type TripDestination =
  | 'ludao'
  | 'lanyu'
  | 'liuqiu'
  | 'kenting'
  | 'other';

export type TripKind = 'padi' | 'aida' | 'experience' | 'other';

export type TripStatus = 'open' | 'sold_out' | 'closed' | 'draft';

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
  status: DiveSiteStatus;
  created_at: string;
  updated_at: string;
};

export type CourseSystem = 'aida' | 'padi' | 'other';
export type CourseStatus = 'open' | 'closed' | 'draft';

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
  status: CourseStatus;
  created_at: string;
  updated_at: string;
};
