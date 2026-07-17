import placesData from "@/data/indonesia-places.json";
import { businesses, type Business, type BusinessId } from "@/lib/business-data";

export type IndonesiaPlace = {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  population: number;
  kind: string;
};

export type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type SurveyPoi = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  category: "competitor" | "anchor";
};

export type LocationSurveyResult = {
  score: number;
  coverage: number;
  competitorCount: number;
  anchorCount: number;
  buildingCount: number;
  accessCount: number;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  components: {
    demand: number;
    competition: number;
    density: number;
    access: number;
    market: number;
  };
  pois: SurveyPoi[];
  timestamp: string;
  osmTimestamp?: string;
};

type PlacesFile = {
  source: string;
  sourceUrl: string;
  license: string;
  snapshot: string;
  count: number;
  places: IndonesiaPlace[];
};

const typedPlaces = placesData as PlacesFile;
export const indonesiaPlaces = typedPlaces.places;
export const placesMeta = {
  source: typedPlaces.source,
  sourceUrl: typedPlaces.sourceUrl,
  license: typedPlaces.license,
  snapshot: typedPlaces.snapshot,
  count: typedPlaces.count,
};

export const normalizeSearch = (value: string) =>
  value.toLocaleLowerCase("id-ID").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const clampScore = (value: number) => Math.min(96, Math.max(45, Math.round(value)));

export const scorePlaceForBusiness = (place: IndonesiaPlace, businessId: BusinessId) => {
  const population = Math.max(place.population, 12_000);
  const market = 48 + (Math.log10(population) - 4) * 15;
  const capitalBonus = place.kind === "PPLC" ? 7 : place.kind === "PPLA" ? 4 : 0;
  const largeMarket = population >= 750_000 ? 6 : population >= 250_000 ? 3 : 0;
  const smallerMarket = population < 180_000 ? 6 : 0;
  const regionalName = normalizeSearch(`${place.name} ${place.province}`);
  const visitorEconomy = /(bali|yogyakarta|bandung|malang|lombok|batam|denpasar)/.test(regionalName) ? 5 : 0;
  const fit: Record<BusinessId, number> = {
    laundry: (population >= 150_000 && population <= 2_500_000 ? 7 : 2) + visitorEconomy,
    kelontong: 5 + smallerMarket,
    franchise: largeMarket + capitalBonus,
    game: (population >= 200_000 ? 6 : 1) + capitalBonus,
    gym: largeMarket + capitalBonus + visitorEconomy,
    coffee: largeMarket + capitalBonus + visitorEconomy,
    barber: 7 + (population >= 100_000 ? 3 : 0),
  };
  return clampScore(market + fit[businessId]);
};

export const getPlaceRecommendation = (place: IndonesiaPlace) => {
  const ranked = businesses
    .map((business) => ({ business, score: scorePlaceForBusiness(place, business.id) }))
    .sort((a, b) => b.score - a.score);
  return { top: ranked[0], ranked };
};

export const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (value: number) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const findNearestPlace = (lat: number, lng: number) => {
  let nearest = indonesiaPlaces[0];
  let distance = Number.POSITIVE_INFINITY;
  for (const place of indonesiaPlaces) {
    const candidate = haversineKm(lat, lng, place.lat, place.lng);
    if (candidate < distance) {
      nearest = place;
      distance = candidate;
    }
  }
  return { place: nearest, distance };
};

const competitorMatchers: Record<BusinessId, (tags: Record<string, string>) => boolean> = {
  laundry: (tags) => tags.shop === "laundry" || tags.craft === "laundry",
  kelontong: (tags) => ["convenience", "supermarket", "general"].includes(tags.shop ?? ""),
  franchise: (tags) => ["fast_food", "cafe"].includes(tags.amenity ?? "") || tags.shop === "beverages",
  game: (tags) => tags.amenity === "internet_cafe"
    || tags.leisure === "amusement_arcade"
    || tags.shop === "video_games",
  gym: (tags) => ["fitness_centre", "sports_centre"].includes(tags.leisure ?? ""),
  coffee: (tags) => tags.amenity === "cafe",
  barber: (tags) => tags.shop === "hairdresser",
};

const anchorMatchers: Record<BusinessId, (tags: Record<string, string>) => boolean> = {
  laundry: (tags) => ["school", "college", "university"].includes(tags.amenity ?? "")
    || ["apartments", "dormitory", "residential"].includes(tags.building ?? ""),
  kelontong: (tags) => ["school", "marketplace", "hospital", "clinic"].includes(tags.amenity ?? "")
    || ["apartments", "residential"].includes(tags.building ?? ""),
  franchise: (tags) => ["school", "college", "university", "marketplace"].includes(tags.amenity ?? "")
    || Boolean(tags.office) || tags.public_transport === "station",
  game: (tags) => ["school", "college", "university"].includes(tags.amenity ?? "")
    || ["apartments", "dormitory"].includes(tags.building ?? ""),
  gym: (tags) => ["college", "university"].includes(tags.amenity ?? "")
    || ["apartments", "residential", "commercial"].includes(tags.building ?? "")
    || Boolean(tags.office),
  coffee: (tags) => ["college", "university", "marketplace"].includes(tags.amenity ?? "")
    || ["commercial", "retail"].includes(tags.building ?? "")
    || Boolean(tags.office) || Boolean(tags.public_transport),
  barber: (tags) => ["school", "college", "marketplace"].includes(tags.amenity ?? "")
    || ["apartments", "residential", "commercial"].includes(tags.building ?? "")
    || Boolean(tags.office),
};

const elementCoordinates = (element: OsmElement) => {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  return typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;
};

const competitionPoints = (count: number, coverage: number) => {
  if (coverage < 25) return 10;
  if (count === 0) return 18;
  if (count <= 3) return 22;
  if (count <= 7) return 15;
  if (count <= 12) return 9;
  return Math.max(2, Math.round(18 - count * 0.8));
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const analyzeOsmSurvey = ({
  business,
  elements,
  place,
  lat,
  lng,
  osmTimestamp,
}: {
  business: Business;
  elements: OsmElement[];
  place: IndonesiaPlace;
  lat: number;
  lng: number;
  osmTimestamp?: string;
}): LocationSurveyResult => {
  const unique = new Map(elements.map((element) => [`${element.type}-${element.id}`, element]));
  const records = [...unique.values()];
  const competitors = records.filter((element) => competitorMatchers[business.id](element.tags ?? {}));
  const anchors = records.filter((element) => anchorMatchers[business.id](element.tags ?? {}));
  const buildings = records.filter((element) => Boolean(element.tags?.building));
  const access = records.filter((element) => Boolean(element.tags?.public_transport)
    || ["primary", "secondary", "tertiary"].includes(element.tags?.highway ?? ""));
  const coverage = clamp(Math.round(records.length / 1.2), 0, 100);

  const components = {
    demand: clamp(Math.round(anchors.length * 1.35), 0, 35),
    competition: competitionPoints(competitors.length, coverage),
    density: clamp(Math.round(buildings.length * 0.28), 0, 15),
    access: clamp(Math.round(access.length * 1.4), 0, 15),
    market: clamp(Math.round((Math.log10(Math.max(place.population, 1_000)) - 3) * 3.2), 2, 10),
  };

  const rawScore = Object.values(components).reduce((sum, value) => sum + value, 0);
  const score = clamp(Math.round(rawScore * (coverage < 25 ? 0.78 : 1)), 0, 100);
  const revenueCenter = business.targetRevenue * (0.72 + score / 200);

  const makePois = (items: OsmElement[], category: SurveyPoi["category"]) => items
    .map((element) => {
      const coordinates = elementCoordinates(element);
      if (!coordinates) return null;
      return {
        id: `${element.type}-${element.id}`,
        name: element.tags?.name || (category === "competitor" ? "Usaha tanpa nama" : "Titik aktivitas"),
        ...coordinates,
        distance: haversineKm(lat, lng, coordinates.lat, coordinates.lng),
        category,
      } satisfies SurveyPoi;
    })
    .filter((poi): poi is SurveyPoi => Boolean(poi));

  const pois = [
    ...makePois(competitors, "competitor"),
    ...makePois(anchors, "anchor"),
  ].sort((a, b) => a.distance - b.distance).slice(0, 40);

  return {
    score,
    coverage,
    competitorCount: competitors.length,
    anchorCount: anchors.length,
    buildingCount: buildings.length,
    accessCount: access.length,
    estimatedRevenueLow: revenueCenter * 0.85,
    estimatedRevenueHigh: revenueCenter * 1.15,
    components,
    pois,
    timestamp: new Date().toISOString(),
    osmTimestamp,
  };
};

export const buildOverpassQuery = (lat: number, lng: number, radius: number) =>
  `[out:json][timeout:20][maxsize:20971520];(`
  + `nwr(around:${radius},${lat},${lng})["shop"~"^(laundry|convenience|supermarket|general|beverages|hairdresser|video_games)$"];`
  + `nwr(around:${radius},${lat},${lng})["amenity"~"^(school|college|university|marketplace|hospital|clinic|fast_food|cafe|internet_cafe)$"];`
  + `nwr(around:${radius},${lat},${lng})["leisure"~"^(amusement_arcade|fitness_centre|sports_centre)$"];`
  + `nwr(around:${radius},${lat},${lng})["craft"="laundry"];`
  + `nwr(around:${radius},${lat},${lng})["office"];`
  + `way(around:${Math.min(350, radius)},${lat},${lng})["building"~"^(apartments|residential|dormitory|commercial|retail)$"];`
  + `nwr(around:${Math.min(600, radius)},${lat},${lng})["public_transport"];`
  + `way(around:${Math.min(300, radius)},${lat},${lng})["highway"~"^(primary|secondary|tertiary)$"];`
  + `);out center tags 350;`;
