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
  assert.match(html, /PDF Full Business Guide/i);
  assert.match(html, /kota pembanding/i);
});

test("every business has a working routed analysis page", async () => {
  assert.equal(businessData.businesses.length, 7);
  assert.equal(businessData.cities.length, 12);

  for (const business of businessData.businesses) {
    const response = await render(`/usaha/${business.slug}`);
    assert.equal(response.status, 200, business.slug);
    const html = await response.text();
    assert.match(html, new RegExp(business.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, /UNIT ECONOMICS/i);
    assert.match(html, /DOWNLOAD BUSINESS PLAN/i);
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
