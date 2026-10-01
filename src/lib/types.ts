export type RegionSlug =
  | "karadeniz"
  | "ege"
  | "akdeniz"
  | "marmara"
  | "ic-anadolu"
  | "dogu-anadolu"
  | "guneydogu-anadolu";

export type ImportanceLevel = "must-see" | "should-see" | "nice-to-have";
export type PlaceCategory =
  | "historical"
  | "nature"
  | "beach"
  | "viewpoint"
  | "museum"
  | "activity"
  | "shopping";
export type DiningType = "restaurant" | "cafe" | "street-food" | "market";
export type PriceRange = "budget" | "mid" | "luxury";
export type CostLevel = "low" | "mid" | "high";
export type AccommodationType = "hotel" | "guesthouse" | "boutique" | "resort";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Region {
  slug: RegionSlug;
  name: string;
  tagline: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  cityCount: number;
  accentColor?: string;
}

export interface PlaceImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface TicketPolicy {
  fullPrice: string;
  studentDiscount?: string;
  museumCardValid?: boolean;
  seniorOrChildFree?: string;
}

export interface DynamicHours {
  summer?: string;
  winter?: string;
  closedOn?: string;
}

export interface Attraction {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  longDescription: string;
  images: PlaceImage[];
  location: GeoPoint;
  address: string;
  openingHours: string;
  entranceFee: string;
  duration: string;
  bestTime: string;
  importance: ImportanceLevel;
  tips: string[];
  accessibility: string;
  phone?: string;
  website?: string;
  regionSlug?: string;
  // Section 3 zenginleştirilmiş metadata (opsiyonel — flagship yerlerde dolu)
  nickname?: string;
  bestPhotoTime?: string;
  ticketPolicy?: TicketPolicy;
  dynamicHours?: DynamicHours;
  parkingTip?: string;
  nearestTransitStop?: string;
  // "ferry": only reachable via a vehicle/passenger ferry from the mainland
  // (an island or opposite-shore town, e.g. Bozcaada/Gökçeada/Eceabat from
  // Çanakkale) — generateItinerary must not mix this into a normal driving
  // day. "boat-tour": only reachable via a guided boat excursion whose
  // departure point is itself on the mainland (e.g. Kekova from Kaş) — still
  // fine same-day, but the transfer isn't a real drive either.
  accessMode?: "ferry" | "boat-tour";
}

export interface Restaurant {
  id: string;
  name: string;
  diningType: DiningType;
  description: string;
  specialties: string[];
  images: PlaceImage[];
  location: GeoPoint;
  address: string;
  priceRange?: PriceRange;
  averageCost?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  reservationNeeded: boolean;
  features: string[];
  regionSlug?: string;
  rating?: number;
  reviewCount?: number;
  // Section 3: fiyat segmenti (1-4 arası $ işareti) ve imza yemek
  priceSegment?: 1 | 2 | 3 | 4;
  signatureDish?: string;
  accessMode?: "ferry" | "boat-tour";
  // Şablon isimli kayıt, belirli bir işletme değil "tür · bölge" önerisi
  // olarak gösteriliyor (bkz. data/cities/sanitize.ts).
  isAreaSuggestion?: boolean;
}

export interface Accommodation {
  id: string;
  name: string;
  type: AccommodationType;
  description: string;
  images: PlaceImage[];
  location: GeoPoint;
  address: string;
  priceRange: PriceRange;
  pricePerNight?: string;
  rating?: number;
  amenities: string[];
  phone?: string;
  website?: string;
  bookingUrl?: string;
  regionSlug?: string;
  accessMode?: "ferry" | "boat-tour";
  isAreaSuggestion?: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  images: PlaceImage[];
  origin: string;
  ingredients: string[];
  whereToTry: Restaurant[];
  bestSeason: string;
  priceRange?: string;
  tips: string;
  importance: ImportanceLevel;
  regionSlug?: string;
}

export type TimeSlot = "morning" | "afternoon" | "evening";

export interface RouteStop {
  order: number;
  title: string;
  description?: string;
  duration: string;
  type: "attraction" | "dining" | "accommodation" | "travel" | "shopping" | "activity";
  itemId?: string;
  location?: GeoPoint;
  tips?: string[];
  timeSlot?: TimeSlot;
  startTime?: string;
  endTime?: string;
  // Carried through from the source Attraction/Restaurant/Accommodation so
  // estimateTransfer/UI can tell a ferry-only stop apart from a normal one.
  accessMode?: "ferry" | "boat-tour";
}

export interface TransferBlock {
  fromOrder: number;
  toOrder: number;
  distanceKm: number;
  // "ferry": either endpoint requires a ferry crossing — distanceKm is still
  // the straight-line hint, but estimatedMinutes is not a real drive time and
  // callers must not render it as one (report follow-up — ferry-only stops
  // like Bozcaada/Gökçeada from Çanakkale were getting a fake "X km / Y dk
  // sürüş" estimate and a driving-mode Maps link, as if reachable by car).
  mode: "walk" | "drive" | "ferry";
  estimatedMinutes: number;
  isLongTransfer?: boolean;
  // true = haversine-distance estimate (×1.3 road factor), false = real Mapbox
  // Directions API result. See report item 57 — estimates must be labeled
  // "yaklaşık", never presented as exact.
  approximate?: boolean;
}

export interface DayPlan {
  day: number;
  title: string;
  theme?: string;
  stops: RouteStop[];
  transfers?: TransferBlock[];
  totalDuration: string;
  distance?: string;
  totalWalkingKm?: number;
  estimatedSpend?: string;
  mealSuggestions?: {
    breakfast: Restaurant;
    lunch: Restaurant;
    dinner: Restaurant;
  };
  accommodationSuggestion?: Accommodation;
  notes?: string;
}

export interface ItineraryRoute {
  id: string;
  title: string;
  description: string;
  days: number;
  summary: string;
  importance: "full-experience" | "highlights" | "quick-visit";
  dayPlans: DayPlan[];
  totalDistance?: string;
  bestSeason: string;
  budgetPerPerson: string;
  images: PlaceImage[];
}

export interface City {
  slug: string;
  regionSlug: RegionSlug;
  name: string;
  title: string;
  summary: string;
  longDescription: string;
  heroTagline: string;
  heroImage: string;
  location: GeoPoint;
  region: string;

  // Practical Info
  howToGetThere: string;
  howToArrive: {
    byAir?: string;
    byBus?: string;
    byTrain?: string;
    byCar?: string;
  };
  whenToGo: string;
  climate: string;
  whereToStay: string;
  budget: string;
  // Şehirler arası göreli maliyet düzeyi (data/cities/sanitize.ts).
  costLevel?: CostLevel;
  budgetBreakdown: {
    accommodation: string;
    food: string;
    activities: string;
    transport: string;
  };
  transportation: string;
  bestDuration: string;

  // Content
  attractions: Attraction[];
  restaurants: Restaurant[];
  accommodations: Accommodation[];
  localFood: FoodItem[];
  itineraries: ItineraryRoute[];

  // Social
  instagram?: string;
  tags: string[];
  highlights: string[];

  // Report items 155/164-171 — real, editor-verified data only, never
  // template-generated filler (see madde 34/167). Left empty until real
  // data exists; the UI shows an honest empty state instead of hiding or
  // fabricating content.
  campingSpots?: CampingSpot[];
  filmLocations?: FilmLocation[];
}

export interface CampingSpot {
  id: string;
  name: string;
  description: string;
  location: GeoPoint;
  hasElectricity: boolean;
  hasWater: boolean;
  isCoastal: boolean;
  isFree: boolean;
  suitableForLargeVehicles: boolean;
}

export interface FilmLocation {
  id: string;
  title: string; // dizi/film adı
  description: string; // burada ne çekildi, hangi sahne
  location?: GeoPoint;
}

export interface RoutePage {
  slug: string;
  title: string;
  regionSlug: RegionSlug;
  citySlugs: string[];
  days: number;
  summary: string;
  intro: string;
  stops: RouteStop[];
  budgetNote: string;
  bestSeason: string;
}
