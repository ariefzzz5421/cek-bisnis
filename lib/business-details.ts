import rawDetails from "@/data/business-details.json";
import type { BusinessId } from "@/lib/business-data";

export type BusinessScale = {
  id: string;
  name: string;
  capex: [number, number];
  capacity: string;
  revenue: [number, number];
  staff: string;
  space: string;
  bestFor: string;
};

export type MarketplaceId = "tokopedia" | "shopee" | "blibli" | "bukalapak";

export type DetailedEquipment = {
  item: string;
  qty: string;
  unitCost: string;
  subtotal: [number, number];
  priority: "Wajib" | "Pendukung";
  /** Kata kunci belanja yang dipakai untuk membangun tautan pencarian marketplace. */
  query: string;
  stores: MarketplaceId[];
  buyingTip: string;
};

export type BusinessDetail = {
  imagePosition: string;
  imageAlt: string;
  priceLabel: string;
  scales: BusinessScale[];
  equipment: DetailedEquipment[];
};

export type Marketplace = {
  name: string;
  /** Label pendek untuk badge di UI dan PDF. */
  tag: string;
  /** Template URL pencarian; `{q}` diganti kata kunci yang sudah di-encode. */
  searchUrl: string;
  /** Warna merek resmi untuk ubin identifikasi. */
  brandColor: string;
  /** Monogram cadangan ketika berkas logo belum tersedia. */
  initials: string;
  /** Nama berkas di `public/brand/marketplace/`; lihat README di folder itu. */
  logoFile?: string;
};

type DetailsFile = {
  note: string;
  marketplaces: Record<MarketplaceId, Marketplace>;
  details: Record<BusinessId, BusinessDetail>;
};

const detailsFile = rawDetails as DetailsFile;

export const businessDetails = detailsFile.details;
export const marketplaces = detailsFile.marketplaces;

export const getBusinessDetail = (id: BusinessId) => businessDetails[id];

export const marketplaceSearchUrl = (store: MarketplaceId, query: string) =>
  marketplaces[store].searchUrl.replace("{q}", encodeURIComponent(query));

export type EquipmentSource = { id: MarketplaceId; name: string; tag: string; url: string };

export const getEquipmentSources = (equipment: DetailedEquipment): EquipmentSource[] =>
  equipment.stores.map((store) => ({
    id: store,
    name: marketplaces[store].name,
    tag: marketplaces[store].tag,
    url: marketplaceSearchUrl(store, equipment.query),
  }));
