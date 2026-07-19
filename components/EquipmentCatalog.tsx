import { ArrowUpRight, Info, PackageCheck, Store } from "lucide-react";
import { formatMoney, type Business } from "@/lib/business-data";
import { getBusinessDetail, getEquipmentSupplier } from "@/lib/business-details";

const xPositions = ["0%", "33.333%", "66.667%", "100%"];

export function EquipmentCatalog({ business }: { business: Business }) {
  const detail = getBusinessDetail(business.id);

  return (
    <div className="equipment-catalog">
      <div className="equipment-catalog__note">
        <Info size={17} aria-hidden="true" />
        <p><b>Harga adalah estimasi Cek Bisnis.</b> Buka vendor untuk cek spesifikasi, garansi, ongkir, dan quotation terbaru.</p>
      </div>

      <div className="equipment-product-grid">
        {detail.equipment.map((item, index) => {
          const supplier = getEquipmentSupplier(business.id, index);
          const position = `${xPositions[index % 4]} ${index < 4 ? "0%" : "100%"}`;

          return (
            <article className="equipment-product" key={item.item}>
              <div
                className="equipment-product__media"
                role="img"
                aria-label={`Visual ${item.item}`}
                style={{
                  backgroundImage: `url(/equipment/${business.slug}-atlas.webp)`,
                  backgroundPosition: position,
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i className={item.priority === "Wajib" ? "is-required" : ""}>{item.priority}</i>
              </div>

              <div className="equipment-product__body">
                <div className="equipment-product__title">
                  <PackageCheck size={19} aria-hidden="true" />
                  <h3>{item.item}</h3>
                </div>
                <dl>
                  <div><dt>Jumlah</dt><dd>{item.qty}</dd></div>
                  <div><dt>Harga / unit</dt><dd>{item.unitCost}</dd></div>
                  <div className="equipment-product__subtotal"><dt>Subtotal</dt><dd>{formatMoney(item.subtotal[0])}-{formatMoney(item.subtotal[1]).replace("Rp", "")}</dd></div>
                </dl>
                <a href={supplier.url} target="_blank" rel="noreferrer" aria-label={`Buka ${supplier.label.toLowerCase()} ${supplier.name} untuk ${item.item}`}>
                  <Store size={17} aria-hidden="true" />
                  <span><small>{supplier.label}</small><b>{supplier.name}</b></span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
