import json
import math
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "business-data.json"
PDF_DIR = ROOT / "public" / "downloads"
PREVIEW_DIR = ROOT / "public" / "previews"

INK = colors.HexColor("#121617")
PAPER = colors.HexColor("#F4F3EE")
MUTED = colors.HexColor("#687171")
LIME = colors.HexColor("#B7F26C")
LINE = colors.HexColor("#D2D3CD")
WHITE = colors.white
RED = colors.HexColor("#FF8A77")


def money(value, decimals=1):
    rounded = round(value, decimals)
    if decimals == 0:
        text = f"{int(round(rounded)):,}".replace(",", ".")
    else:
        text = f"{rounded:,.1f}".replace(",", "_").replace(".", ",").replace("_", ".")
        if text.endswith(",0"):
            text = text[:-2]
    return f"Rp{text} jt"


def metrics(business, city, revenue=None):
    monthly_revenue = revenue or round(business["targetRevenue"] * city["demandFactor"])
    payroll_base = business["staffCount"] * business["staffCostBase"]
    other_fixed = business["fixedBase"] - business["rentBase"] - payroll_base
    rent = business["rentBase"] * city["rentFactor"]
    payroll = payroll_base * city["wageFactor"]
    fixed = max(1, other_fixed + rent + payroll)
    capex_low = business["capex"][0] * city["capexFactor"]
    capex_high = business["capex"][1] * city["capexFactor"]
    capex_mid = (capex_low + capex_high) / 2
    bep = fixed / (1 - business["variableRate"])
    opex = fixed + monthly_revenue * business["variableRate"]
    profit = monthly_revenue * (1 - business["variableRate"]) - fixed
    if business["trafficMode"] == "member":
        traffic = math.ceil(bep / business["avgTicket"])
    else:
        traffic = math.ceil(bep / business["avgTicket"] / 30)
    payback = math.ceil(capex_mid / profit) if profit > 0 else None
    return {
        "revenue": monthly_revenue,
        "revenue_low": monthly_revenue * 0.86,
        "revenue_high": monthly_revenue * 1.14,
        "fixed": fixed,
        "rent": rent,
        "payroll": payroll,
        "capex_low": capex_low,
        "capex_high": capex_high,
        "capex_mid": capex_mid,
        "bep": bep,
        "opex": opex,
        "profit": profit,
        "traffic": traffic,
        "payback": payback,
    }


def draw_brandmark(pdf, x, y, size=34, accent=LIME):
    pdf.setFillColor(INK)
    pdf.roundRect(x, y, size, size, size * 0.18, stroke=0, fill=1)
    pdf.setFillColor(accent)
    canopy_y = y + size * 0.76
    segment_w = size * 0.15
    for idx in range(4):
        pdf.roundRect(x + size * 0.17 + idx * size * 0.17, canopy_y, segment_w, size * 0.12, size * 0.04, stroke=0, fill=1)
    pdf.setFillColor(WHITE)
    pdf.setFont("Helvetica-Bold", size * 0.33)
    pdf.drawCentredString(x + size / 2, y + size * 0.32, "CB")


def wrap_lines(text, max_width, font_name, font_size):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(pdf, text, x, y, max_width, font_name="Helvetica", font_size=9, leading=13, color=MUTED, max_lines=None):
    pdf.setFont(font_name, font_size)
    pdf.setFillColor(color)
    lines = wrap_lines(text, max_width, font_name, font_size)
    if max_lines:
        lines = lines[:max_lines]
    cursor_y = y
    for line in lines:
        pdf.drawString(x, cursor_y, line)
        cursor_y -= leading
    return cursor_y


def draw_footer(pdf, page_number, updated_at):
    width, _ = A4
    pdf.setStrokeColor(LINE)
    pdf.line(42, 34, width - 42, 34)
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 7)
    pdf.drawString(42, 20, f"CEK BISNIS - diperbarui {updated_at}")
    pdf.drawRightString(width - 42, 20, f"Halaman {page_number}")


def draw_page_header(pdf, title, subtitle, accent, page_number, updated_at):
    width, height = A4
    draw_brandmark(pdf, 42, height - 68, 32, accent)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(84, height - 48, "CEK BISNIS")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 7)
    pdf.drawString(84, height - 61, "FULL BUSINESS GUIDE")
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 23)
    pdf.drawString(42, height - 112, title)
    draw_wrapped(pdf, subtitle, 42, height - 132, width - 84, font_size=9, leading=12)
    draw_footer(pdf, page_number, updated_at)


def draw_metric_box(pdf, x, y, width, height, label, value, note, accent=None):
    pdf.setFillColor(accent or colors.white)
    pdf.roundRect(x, y, width, height, 8, stroke=0, fill=1)
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica-Bold", 7)
    pdf.drawString(x + 12, y + height - 20, label.upper())
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(x + 12, y + height - 43, value)
    draw_wrapped(pdf, note, x + 12, y + 14, width - 24, font_size=7, leading=9, max_lines=2)


def generate_pdf(data, business):
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    path = PDF_DIR / f"cek-bisnis-{business['slug']}-guide.pdf"
    pdf = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    accent = colors.HexColor(business["accent"])
    baseline_city = next(city for city in data["cities"] if city["id"] == "semarang")
    baseline = metrics(business, baseline_city)
    source_map = {source["id"]: source for source in data["sources"]}
    business_sources = [source_map[source_id] for source_id in business["sourceIds"]]

    # Cover
    pdf.setFillColor(INK)
    pdf.rect(0, 0, width, height, stroke=0, fill=1)
    pdf.setFillColor(accent)
    pdf.circle(width - 55, height - 55, 115, stroke=0, fill=1)
    draw_brandmark(pdf, 44, height - 90, 46, accent)
    pdf.setFillColor(WHITE)
    pdf.setFont("Helvetica-Bold", 15)
    pdf.drawString(104, height - 61, "CEK BISNIS")
    pdf.setFillColor(colors.HexColor("#8A9292"))
    pdf.setFont("Helvetica", 8)
    pdf.drawString(104, height - 76, "FULL BUSINESS GUIDE - 2026")
    pdf.setFillColor(accent)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(44, height - 210, business["category"].upper())
    pdf.setFillColor(WHITE)
    title_y = height - 257
    for line in wrap_lines(business["name"], width - 88, "Helvetica-Bold", 35):
        pdf.setFont("Helvetica-Bold", 35)
        pdf.drawString(44, title_y, line)
        title_y -= 40
    draw_wrapped(pdf, business["oneLine"], 44, title_y - 10, width - 120, font_size=12, leading=17, color=colors.HexColor("#B9BDBC"))
    box_y = 160
    pdf.setFillColor(colors.HexColor("#202728"))
    pdf.roundRect(44, box_y, width - 88, 150, 14, stroke=0, fill=1)
    pdf.setFillColor(colors.HexColor("#8A9292"))
    pdf.setFont("Helvetica-Bold", 8)
    pdf.drawString(64, box_y + 119, "BASELINE NASIONAL")
    pdf.setFillColor(WHITE)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(64, box_y + 86, f"Modal {money(baseline['capex_low'], 0)} - {money(baseline['capex_high'], 0).replace('Rp', '')}")
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(colors.HexColor("#C5C9C8"))
    pdf.drawString(64, box_y + 57, f"Omzet target {money(baseline['revenue'], 0)} / bulan")
    pdf.drawString(64, box_y + 38, f"Omzet BEP {money(baseline['bep'])} / bulan")
    pdf.setFillColor(accent)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(64, box_y + 17, f"{baseline['traffic']} {business['trafficLabel']} minimum")
    pdf.setFillColor(colors.HexColor("#858C8C"))
    pdf.setFont("Helvetica", 7)
    pdf.drawString(44, 60, "Estimasi screening awal. Gunakan quotation vendor dan survei lokal sebelum berinvestasi.")
    pdf.showPage()

    # Page 2 - executive preview
    draw_page_header(pdf, "Ringkasan kelayakan", business["description"], accent, 2, data["updatedAt"])
    y = height - 190
    card_width = (width - 96) / 2
    draw_metric_box(pdf, 42, y - 95, card_width, 88, "CAPEX", f"{money(baseline['capex_low'],0)} - {money(baseline['capex_high'],0).replace('Rp','')}", "Alat, fit-out, deposit, dan kas awal.")
    draw_metric_box(pdf, 54 + card_width, y - 95, card_width, 88, "OPEX", f"{money(baseline['opex'])} / bln", "Pada omzet target baseline nasional.")
    draw_metric_box(pdf, 42, y - 195, card_width, 88, "BEP OMZET", f"{money(baseline['bep'])} / bln", f"Butuh {baseline['traffic']} {business['trafficLabel']}.", accent)
    draw_metric_box(pdf, 54 + card_width, y - 195, card_width, 88, "BALIK MODAL", f"{baseline['payback'] or '-'} bulan", "Jika target stabil dan tidak ada cicilan.")
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(42, y - 235, "Format usaha")
    draw_wrapped(pdf, business["format"], 42, y - 255, width - 84, font_size=9, leading=13)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.setFillColor(INK)
    pdf.drawString(42, y - 315, "Siapa yang cocok")
    draw_wrapped(pdf, business["idealFor"], 42, y - 335, width - 84, font_size=9, leading=13)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.setFillColor(INK)
    pdf.drawString(42, y - 395, "Sinyal lokasi")
    draw_wrapped(pdf, business["locationSignal"], 42, y - 415, width - 84, font_size=9, leading=13)
    pdf.showPage()

    # Page 3 - capital plan
    draw_page_header(pdf, "Rencana modal dan alat", "Rentang harga adalah benchmark awal. Minta minimal dua quotation lokal sebelum membeli.", accent, 3, data["updatedAt"])
    y = height - 185
    for index, item in enumerate(business["equipment"], start=1):
        pdf.setFillColor(colors.white)
        pdf.roundRect(42, y - 84, width - 84, 74, 8, stroke=0, fill=1)
        pdf.setFillColor(accent)
        pdf.circle(62, y - 34, 12, stroke=0, fill=1)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawCentredString(62, y - 37, f"{index:02d}")
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(84, y - 27, item["item"])
        draw_wrapped(pdf, item["note"], 84, y - 45, width - 240, font_size=8, leading=10, max_lines=2)
        pdf.setFont("Helvetica-Bold", 9)
        pdf.setFillColor(INK)
        pdf.drawRightString(width - 56, y - 33, item["range"])
        y -= 86
    pdf.setFillColor(colors.HexColor("#FFF0EC"))
    pdf.roundRect(42, y - 78, width - 84, 66, 8, stroke=0, fill=1)
    pdf.setFillColor(RED)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(56, y - 34, "BUFFER WAJIB")
    draw_wrapped(pdf, "Tambahkan kas cadangan 15-25% untuk biaya alat, renovasi, sewa, dan masa ramp-up yang meleset.", 56, y - 51, width - 112, font_size=8, leading=10, color=colors.HexColor("#72524B"))
    pdf.showPage()

    # Page 4 - operations
    draw_page_header(pdf, "Operasi dan validasi", "Fokus pada aktivitas yang langsung memengaruhi kualitas, throughput, dan pelanggan berulang.", accent, 4, data["updatedAt"])
    column_w = (width - 98) / 2
    left_x = 42
    right_x = 56 + column_w
    top_y = height - 185
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(left_x, top_y, "Alur harian")
    y_left = top_y - 28
    for index, item in enumerate(business["dailyOps"], start=1):
        pdf.setFillColor(accent)
        pdf.circle(left_x + 9, y_left + 2, 8, stroke=0, fill=1)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 7)
        pdf.drawCentredString(left_x + 9, y_left, str(index))
        y_left = draw_wrapped(pdf, item, left_x + 26, y_left + 3, column_w - 26, font_size=8, leading=11) - 12
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(right_x, top_y, "Checklist sebelum sewa")
    y_right = top_y - 28
    for item in business["checklist"]:
        pdf.setFillColor(LIME)
        pdf.roundRect(right_x, y_right - 4, 10, 10, 2, stroke=0, fill=1)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 7)
        pdf.drawCentredString(right_x + 5, y_right - 1, "v")
        y_right = draw_wrapped(pdf, item, right_x + 18, y_right + 2, column_w - 18, font_size=8, leading=11) - 12
    y_box = min(y_left, y_right) - 30
    pdf.setFillColor(colors.HexColor("#FFF0EC"))
    pdf.roundRect(42, y_box - 145, width - 84, 130, 10, stroke=0, fill=1)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(58, y_box - 40, "Risiko utama")
    risk_y = y_box - 66
    for risk in business["risks"]:
        pdf.setFillColor(RED)
        pdf.circle(62, risk_y + 2, 3, stroke=0, fill=1)
        risk_y = draw_wrapped(pdf, risk, 74, risk_y + 4, width - 140, font_size=8, leading=11, color=colors.HexColor("#72524B")) - 7
    pdf.showPage()

    # Page 5 - city ranking
    draw_page_header(pdf, "Ranking kota dan omzet", "Skor menimbang demand, biaya, daya beli, dan kompetisi. Estimasi omzet bukan penjualan outlet aktual.", accent, 5, data["updatedAt"])
    ranked = sorted(data["cities"], key=lambda city: city["scores"][business["id"]], reverse=True)
    y = height - 178
    pdf.setFillColor(INK)
    pdf.roundRect(42, y - 24, width - 84, 24, 5, stroke=0, fill=1)
    pdf.setFillColor(WHITE)
    pdf.setFont("Helvetica-Bold", 7)
    headers = [("RANK", 52), ("KOTA", 88), ("AREA SURVEI", 200), ("EST. OMZET", 390), ("SKOR", 515)]
    for label, x in headers:
        pdf.drawString(x, y - 16, label)
    y -= 31
    for index, city in enumerate(ranked[:8], start=1):
        city_metrics = metrics(business, city)
        pdf.setFillColor(colors.white if index % 2 else colors.HexColor("#ECECE6"))
        pdf.rect(42, y - 47, width - 84, 47, stroke=0, fill=1)
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 8)
        pdf.drawString(52, y - 28, f"{index:02d}")
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(88, y - 21, city["name"])
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 7)
        pdf.drawString(88, y - 34, city["province"])
        draw_wrapped(pdf, " / ".join(city["hotspots"][:2]), 200, y - 21, 170, font_size=7, leading=9, max_lines=2)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawString(390, y - 25, f"{money(city_metrics['revenue_low'],0)}-{money(city_metrics['revenue_high'],0).replace('Rp','')}")
        pdf.setFillColor(accent)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(520, y - 27, str(city["scores"][business["id"]]))
        y -= 49
    pdf.setFillColor(colors.HexColor("#FFF0EC"))
    pdf.roundRect(42, y - 70, width - 84, 56, 8, stroke=0, fill=1)
    draw_wrapped(pdf, "Wajib: hitung traffic per 15 menit pada pagi, siang, sore, malam, dan akhir pekan selama minimal 7 hari.", 56, y - 36, width - 112, font_name="Helvetica-Bold", font_size=8, leading=11, color=colors.HexColor("#72524B"))
    pdf.showPage()

    # Page 6 - 90 day plan and sources
    draw_page_header(pdf, "Rencana 90 hari", "Tiga gerbang eksekusi untuk mengurangi risiko sebelum menambah modal.", accent, 6, data["updatedAt"])
    card_w = (width - 112) / 3
    for index, phase in enumerate(business["plan90"]):
        x = 42 + index * (card_w + 14)
        y = height - 375
        pdf.setFillColor(INK)
        pdf.roundRect(x, y, card_w, 200, 10, stroke=0, fill=1)
        pdf.setFillColor(accent)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawString(x + 14, y + 171, phase["phase"])
        pdf.setFillColor(WHITE)
        pdf.setFont("Helvetica-Bold", 12)
        title_lines = wrap_lines(phase["title"], card_w - 28, "Helvetica-Bold", 12)
        title_y = y + 145
        for line in title_lines[:2]:
            pdf.drawString(x + 14, title_y, line)
            title_y -= 15
        action_y = y + 102
        for action in phase["actions"]:
            pdf.setFillColor(accent)
            pdf.circle(x + 18, action_y + 2, 2.5, stroke=0, fill=1)
            action_y = draw_wrapped(pdf, action, x + 26, action_y + 4, card_w - 40, font_size=7, leading=9, color=colors.HexColor("#C1C5C4")) - 7
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(42, height - 420, "Izin yang perlu dicek")
    permit_y = height - 445
    for permit in business["permits"]:
        pdf.setFillColor(LIME)
        pdf.circle(47, permit_y + 2, 3, stroke=0, fill=1)
        permit_y = draw_wrapped(pdf, permit, 58, permit_y + 4, width - 100, font_size=8, leading=11) - 7
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(42, height - 520, "Sumber data")
    source_y = height - 545
    for source in business_sources:
        host = urlparse(source["url"]).netloc.replace("www.", "")
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawString(42, source_y, source["title"])
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 7)
        pdf.drawRightString(width - 42, source_y, host)
        source_y -= 15
    pdf.setFillColor(colors.HexColor("#FFF0EC"))
    pdf.roundRect(42, 60, width - 84, 64, 8, stroke=0, fill=1)
    draw_wrapped(pdf, "RISIKO: Dokumen ini adalah screening awal, bukan jaminan untung. Harga alat, sewa, upah, pajak, dan demand nyata dapat berbeda per titik.", 56, 98, width - 112, font_name="Helvetica-Bold", font_size=8, leading=11, color=colors.HexColor("#72524B"))
    pdf.showPage()
    pdf.save()
    return path


def load_font(size, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def pil_wrapped(draw, text, xy, font, fill, max_width, line_gap=8):
    x, y = xy
    words = text.split()
    line = ""
    lines = []
    for word in words:
        candidate = f"{line} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    line_height = draw.textbbox((0, 0), "Ag", font=font)[3] + line_gap
    for item in lines:
        draw.text((x, y), item, font=font, fill=fill)
        y += line_height
    return y


def generate_preview(data, business):
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    city = next(city for city in data["cities"] if city["id"] == "kediri")
    result = metrics(business, city)
    image = Image.new("RGB", (1200, 1500), "#F4F3EE")
    draw = ImageDraw.Draw(image)
    accent = business["accent"]
    draw.rectangle((0, 0, 1200, 330), fill="#121617")
    draw.rounded_rectangle((72, 68, 174, 170), radius=22, fill=accent)
    draw.text((92, 97), "CB", font=load_font(45, True), fill="#121617")
    for index in range(4):
        draw.rounded_rectangle((82 + index * 22, 76, 100 + index * 22, 91), radius=5, fill="#B7F26C")
    draw.text((202, 82), "CEK BISNIS", font=load_font(34, True), fill="#FFFFFF")
    draw.text((202, 132), "BUSINESS PREVIEW - JULI 2026", font=load_font(18, True), fill="#7F8888")
    draw.text((72, 213), business["category"].upper(), font=load_font(20, True), fill=accent)
    draw.text((72, 255), business["name"], font=load_font(58, True), fill="#FFFFFF")
    draw.text((72, 380), "Kediri, Jawa Timur", font=load_font(23, True), fill="#121617")
    pil_wrapped(draw, business["oneLine"], (72, 430), load_font(24), "#687171", 1020, 9)
    cards = [
        ("MODAL AWAL", f"{money(result['capex_low'],0)} - {money(result['capex_high'],0).replace('Rp','')}", "#FFFFFF"),
        ("OMZET TARGET", f"{money(result['revenue'],0)} / bulan", "#FFFFFF"),
        ("OMZET BEP", f"{money(result['bep'])} / bulan", accent),
        ("MINIMUM TRAFFIC", f"{result['traffic']} {business['trafficLabel']}", "#FFFFFF"),
    ]
    for index, (label, value, fill) in enumerate(cards):
        column = index % 2
        row = index // 2
        x = 72 + column * 530
        y = 540 + row * 205
        draw.rounded_rectangle((x, y, x + 500, y + 175), radius=22, fill=fill)
        draw.text((x + 28, y + 28), label, font=load_font(17, True), fill="#687171")
        pil_wrapped(draw, value, (x + 28, y + 78), load_font(30, True), "#121617", 440, 6)
    draw.rounded_rectangle((72, 978, 1130, 1272), radius=24, fill="#121617")
    draw.text((108, 1012), f"SKOR LOKASI {city['scores'][business['id']]}/100", font=load_font(21, True), fill=accent)
    draw.text((108, 1062), "Titik survei yang disarankan", font=load_font(31, True), fill="#FFFFFF")
    for index, hotspot in enumerate(city["hotspots"]):
        y = 1124 + index * 47
        draw.ellipse((111, y, 121, y + 10), fill=accent)
        draw.text((140, y - 8), hotspot, font=load_font(23), fill="#C8CCCC")
    pil_wrapped(draw, "Estimasi indikatif. Survei traffic dan pesaing radius lokal minimal 7 hari sebelum menyewa tempat.", (72, 1365), load_font(17), "#7A8181", 930, 7)
    draw.text((72, 1432), "cek-bisnis-indonesia.ariefz.chatgpt.site", font=load_font(17, True), fill="#121617")
    path = PREVIEW_DIR / f"{business['slug']}.png"
    image.save(path, quality=95)
    return path


def main():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    generated = []
    for business in data["businesses"]:
        generated.append(generate_pdf(data, business))
        generated.append(generate_preview(data, business))
    print(f"Generated {len(generated)} files")
    for path in generated:
        print(path)


if __name__ == "__main__":
    main()
