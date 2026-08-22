# Logo merek waralaba

Berkas di folder ini dipetakan ke id merek lewat `lib/brand-logo-assets.ts`,
yang **dibangkitkan otomatis** oleh `scripts/import-brand-logos.mjs`. Jangan
mengedit berkas TypeScript itu langsung.

```
node scripts/import-brand-logos.mjs
```

## Dari mana logonya

| Sumber | Merek | Lisensi |
| --- | --- | --- |
| Diunggah manual ke repo | Alfamart, Ayam Geprek Sa'i, Baba Rafi, Bingxue, Doyan Ayam, Es Teh Indonesia, Es Teh Poci, Geprek Bensu, J&T Express, Janji Jiwa, KOPIGO, Mr Klin, Nyoklat Klasik, Point Coffee, Sabana, Tahu Go | — |
| npm [`idn-finlogos@2.5.0`](https://github.com/hafidznoor/idn-finlogos) | Alfamidi, Anteraja, FamilyMart, Indomaret, JNE, Lawson, Lion Parcel, Ninja Xpress, OMI Indogrosir, SiCepat, Wahana Express, Yomart | CC BY-NC 4.0 (kurasi) |

Koleksi itu berisi ribuan ikon, jadi tiap kandidat dicocokkan secara visual
sebelum dipakai, bukan hanya berdasarkan kemiripan nama. Ikon bernama `212` di
sana, misalnya, ternyata milik Bank Woori Saudara (kode bank 212) dan sama
sekali bukan 212 Mart.

## Ketentuan yang perlu diketahui

Aset SVG dari `idn-finlogos` dirilis dengan lisensi **CC BY-NC 4.0**, dan
lisensi itu hanya menutupi **kurasi koleksinya**, bukan merek dagangnya. Dua
konsekuensi yang perlu disadari pemilik situs:

1. **Atribusi wajib.** Kredit ke koleksi dan tautan lisensinya harus terlihat.
   Di situs ini kredit itu ada di bagian sumber halaman `/franchise`. Salinan
   teks lisensinya disimpan di `LICENSE-ASSETS.txt` pada folder ini.
2. **NonCommercial.** Kalau situs ini nantinya dimonetisasi (iklan, langganan,
   afiliasi berbayar), pemakaian aset dari koleksi itu perlu ditinjau ulang dan
   sebaiknya diganti berkas resmi langsung dari tiap brand.

Logo merek dipakai di sini untuk **identifikasi** merek yang sedang dibahas.
Pemakaian itu tidak menyatakan afiliasi, dukungan, atau kemitraan dengan
pemilik merek mana pun.

## Merek yang belum punya berkas logo

Sisanya memakai monogram berwarna merek, bukan ilustrasi kategori bersama —
satu gambar yang sama untuk sepuluh merek justru membuat merek sulit dibedakan.

Sebagian merek masih meng-hotlink logo dari server brand lewat kolom `logoUrl`
di `data/franchise-data.json`. Cara itu bergantung pada server pihak lain dan
bisa berhenti bekerja kapan saja, jadi berkas lokal selalu lebih baik.

## Menambahkan logo resmi sendiri

1. Taruh berkasnya di folder ini (`.svg`, `.png`, atau `.webp`).
2. Tambahkan entri `"<id-merek>": "<nama-berkas>"` ke `ALREADY_IN_REPO` di
   `scripts/import-brand-logos.mjs`.
3. Jalankan `node scripts/import-brand-logos.mjs`.

Dimensi intrinsiknya dibaca otomatis, dan ubin logo akan melebar sendiri kalau
bentuknya wordmark supaya tidak mengecil sampai tidak terbaca.
