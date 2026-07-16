import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const businessData = JSON.parse(
  await readFile(new URL("../data/business-data.json", import.meta.url), "utf8"),
);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Cek Bisnis landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Cek Bisnis - Panduan Modal, OPEX dan BEP/i);
  assert.match(html, /Pilih jenis usaha/i);
  assert.match(html, /Survei seluruh Indonesia/i);
  assert.match(html, /497/i);
  assert.match(html, /PDF · 3 halaman/i);
});

test("server-renders the all-Indonesia location survey", async () => {
  const response = await render("/survei-lokasi");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Survei usaha/i);
  assert.match(html, /Klik titik\. Baca peluang/i);
  assert.match(html, /Jalankan survei/i);
});

test("every business has a working routed analysis page", async () => {
  assert.equal(businessData.businesses.length, 7);
  assert.equal(businessData.cities.length, 12);

  for (const business of businessData.businesses) {
    const response = await render(`/usaha/${business.slug}`);
    assert.equal(response.status, 200, business.slug);
    const html = await response.text();
    assert.match(html, new RegExp(business.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, /HITUNG ANGKA/i);
    assert.match(html, /SURVEI LOKASI/i);
    assert.match(html, /PDF panduan 3 halaman/i);
  }
});

test("every business ships a PDF guide and PNG preview", async () => {
  for (const business of businessData.businesses) {
    const pdfUrl = new URL(`../public/downloads/cek-bisnis-${business.slug}-guide.pdf`, import.meta.url);
    const pngUrl = new URL(`../public/previews/${business.slug}.png`, import.meta.url);
    const [pdfInfo, pngInfo, pdf, png] = await Promise.all([
      stat(pdfUrl),
      stat(pngUrl),
      readFile(pdfUrl),
      readFile(pngUrl),
    ]);

    assert.ok(pdfInfo.size > 10_000, `${business.slug} PDF is unexpectedly small`);
    assert.ok(pngInfo.size > 20_000, `${business.slug} preview is unexpectedly small`);
    assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
});

test("every business ships a realistic scene and the landing tour video", async () => {
  for (const business of businessData.businesses) {
    const imageUrl = new URL(`../public/businesses/${business.slug}.jpg`, import.meta.url);
    const [info, file] = await Promise.all([stat(imageUrl), readFile(imageUrl)]);
    assert.ok(info.size > 100_000, `${business.slug} scene is unexpectedly small`);
    assert.deepEqual([...file.subarray(0, 3)], [255, 216, 255]);
  }
  const videoInfo = await stat(new URL("../public/businesses/business-tour.mp4", import.meta.url));
  assert.ok(videoInfo.size > 1_000_000, "business tour video is unexpectedly small");
});
