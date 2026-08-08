# Ubin merek marketplace

Berkas SVG di folder ini berasal dari paket npm [simple-icons](https://simpleicons.org)
versi 16.x, yang paketnya dirilis di bawah lisensi **CC0-1.0**. Bentuk logonya
tetap merupakan merek dagang pemilik masing-masing dan dipakai di sini hanya
untuk identifikasi tautan belanja — bukan sebagai tanda afiliasi atau dukungan.

Ikon simple-icons berupa siluet satu warna. Karena itu komponen
`MarketplaceMark` merendernya sebagai CSS mask lalu mewarnainya, bukan sebagai
`<img>` biasa yang tidak bisa diwarnai.

## Yang belum ada di sini

- **Tokopedia** tidak tersedia di simple-icons versi mana pun, dan tidak ada
  paket npm lain yang memuatnya. Ubinnya tetap memakai monogram sampai berkas
  resminya tersedia.

## Menambahkan logo resmi sendiri

1. Taruh berkas SVG di folder ini, mis. `tokopedia.svg`.
2. Isi `logoFile` pada entri marketplace di `data/business-details.json`.

Komponen akan otomatis memakainya tanpa perubahan kode.
