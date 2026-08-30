from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_ROOT = ROOT / "public" / "samples" / "trade-packs"
WIDTH, HEIGHT = 1200, 1550
MARGIN = 76

BLACK = (17, 17, 17)
INK = (48, 48, 54)
MUTED = (95, 95, 102)
ORANGE = (255, 102, 0)
WARM = (246, 244, 241)
LINE = (226, 222, 217)
WHITE = (255, 255, 255)


def font(size: int, bold: bool = False):
    candidates = [
        Path(r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"),
        Path(r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


F_BRAND = font(21, True)
F_TITLE = font(38, True)
F_SECTION = font(21, True)
F_BODY = font(18)
F_SMALL = font(15)
F_WATERMARK = font(58, True)


PACKS = {
    "electrical-contractor-pack": {
        "trade": "ELECTRICAL CONTRACTOR",
        "samples": [
            ("quotation", "Quotation", "quote"),
            ("job-record", "Job Record", "record"),
            ("invoice", "Invoice (not VAT registered)", "invoice"),
            ("admin-workbook", "Administration Workbook", "workbook"),
        ],
    },
    "plumbing-contractor-pack": {
        "trade": "PLUMBING CONTRACTOR",
        "samples": [
            ("quotation", "Quotation", "quote"),
            ("job-record", "Job Record", "record"),
            ("plumbers-report", "Plumber's Report for Insurance Claims", "report"),
            ("admin-workbook", "Administration Workbook", "workbook"),
        ],
    },
    "solar-installer-pack": {
        "trade": "SOLAR INSTALLER",
        "samples": [
            ("site-assessment", "Site Assessment", "assessment"),
            ("quotation", "Quotation", "quote"),
            ("installation-commissioning", "Installation and Commissioning Record", "commissioning"),
            ("admin-workbook", "Administration Workbook", "workbook"),
        ],
    },
    "electric-fence-installer-pack": {
        "trade": "ELECTRIC FENCE INSTALLER",
        "samples": [
            ("quotation", "Quotation", "quote"),
            ("installation-record", "Installation Record", "record"),
            ("inspection-certification-report", "Inspection and Certification Report", "report"),
            ("admin-workbook", "Administration Workbook", "workbook"),
        ],
    },
}


def text(draw, xy, value, selected_font, fill=INK):
    draw.text(xy, value, font=selected_font, fill=fill)


def section(draw, y, label):
    draw.rounded_rectangle((MARGIN, y, WIDTH - MARGIN, y + 44), radius=8, fill=WARM)
    text(draw, (MARGIN + 17, y + 11), label.upper(), F_SECTION, ORANGE)
    return y + 68


def line(draw, y, label, value="Sample Trade Business"):
    text(draw, (MARGIN, y), label, F_SMALL, MUTED)
    draw.line((MARGIN, y + 30, WIDTH - MARGIN, y + 30), fill=LINE, width=2)
    text(draw, (MARGIN + 220, y + 4), value, F_BODY, INK)
    return y + 52


def draw_table(draw, y, headings, rows=4):
    widths = [int((WIDTH - MARGIN * 2) / len(headings))] * len(headings)
    x = MARGIN
    for width, heading in zip(widths, headings):
        draw.rectangle((x, y, x + width, y + 42), fill=BLACK)
        text(draw, (x + 10, y + 12), heading, F_SMALL, WHITE)
        x += width
    for row in range(rows):
        x = MARGIN
        for width in widths:
            draw.rectangle((x, y + 42 + row * 45, x + width, y + 87 + row * 45), outline=LINE, width=2)
            x += width
    return y + 42 + rows * 45


def add_watermark(image):
    overlay = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)
    watermark = "DOKKIT SAMPLE - NOT FOR USE"
    for y in (490, 940):
        draw.text((105, y), watermark, font=F_WATERMARK, fill=(197, 65, 0, 86), stroke_width=1, stroke_fill=(255, 255, 255, 55))
    overlay = overlay.rotate(24, expand=False, resample=Image.Resampling.BICUBIC)
    return Image.alpha_composite(image.convert("RGBA"), overlay)


def draw_document(trade, title, kind):
    image = Image.new("RGB", (WIDTH, HEIGHT), WHITE)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, WIDTH, 82), fill=BLACK)
    text(draw, (MARGIN, 27), "DOKKIT", F_BRAND, WHITE)
    text(draw, (WIDTH - 320, 29), "WATERMARKED SAMPLE", F_SMALL, (255, 212, 181))
    text(draw, (MARGIN, 118), trade, F_SMALL, ORANGE)
    text(draw, (MARGIN, 152), title, F_TITLE, BLACK)
    text(draw, (MARGIN, 205), "Fictional demonstration layout - editable files are included after purchase.", F_BODY, MUTED)
    y = 270

    if kind == "workbook":
        y = section(draw, y, "Administration workbook - dashboard sample")
        text(draw, (MARGIN, y), "Sample Trade Business", F_SECTION, BLACK)
        text(draw, (MARGIN, y + 34), "Representative view only. Formulae, hidden settings and editable workbook are not included.", F_SMALL, MUTED)
        y += 82
        y = draw_table(draw, y, ["CLIENT", "JOB", "STATUS", "INVOICE", "AMOUNT"], rows=7)
        y += 48
        y = section(draw, y, "At a glance")
        for index, (label, amount) in enumerate((("Open jobs", "3"), ("Invoices due", "2"), ("Expenses logged", "5"))):
            x = MARGIN + index * 335
            draw.rounded_rectangle((x, y, x + 295, y + 125), radius=10, fill=WARM, outline=LINE)
            text(draw, (x + 20, y + 20), label, F_SMALL, MUTED)
            text(draw, (x + 20, y + 56), amount, F_TITLE, BLACK)
    else:
        y = section(draw, y, "Business and customer details")
        y = line(draw, y, "Business", "Sample Trade Business")
        y = line(draw, y, "Customer", "Demo Customer")
        y = line(draw, y, "Reference", "SAMPLE-001")
        y += 14
        labels = {
            "quote": ("Scope and pricing", ["DESCRIPTION", "QTY", "RATE", "TOTAL"]),
            "invoice": ("Invoice items", ["DESCRIPTION", "QTY", "RATE", "TOTAL"]),
            "record": ("Work record", ["ACTIVITY", "DETAILS", "DATE", "SIGN-OFF"]),
            "report": ("Findings and report details", ["ITEM", "OBSERVATION", "ACTION", "STATUS"]),
            "assessment": ("Assessment prompts", ["AREA", "OBSERVATION", "REQUIREMENT", "NOTES"]),
            "commissioning": ("Installation and commissioning", ["CHECK", "RESULT", "DATE", "INITIALS"]),
        }
        heading, columns = labels[kind]
        y = section(draw, y, heading)
        y = draw_table(draw, y, columns, rows=5)
        y += 48
        y = section(draw, y, "Notes and acknowledgement")
        for offset in (0, 38, 76):
            draw.line((MARGIN, y + offset, WIDTH - MARGIN, y + offset), fill=LINE, width=2)

    image = add_watermark(image)
    final = ImageDraw.Draw(image)
    final.rectangle((0, HEIGHT - 70, WIDTH, HEIGHT), fill=BLACK)
    text(final, (MARGIN, HEIGHT - 48), "Preview copy - Purchase required for editable files - dokkit.co.za", F_SMALL, WHITE)
    return image.convert("RGB")


def main():
    generated = 0
    for slug, pack in PACKS.items():
        folder = OUTPUT_ROOT / slug
        folder.mkdir(parents=True, exist_ok=True)
        for sample_id, title, kind in pack["samples"]:
            output = folder / f"{sample_id}-sample.png"
            draw_document(pack["trade"], title, kind).save(output, format="PNG", optimize=True)
            generated += 1
    print(f"Generated {generated} watermarked trade-pack sample images in {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
