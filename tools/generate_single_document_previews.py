from __future__ import annotations

import re
from pathlib import Path

from docx import Document
from openpyxl import load_workbook
from PIL import Image, ImageDraw, ImageFont


SOURCE_ROOT = Path(
    r"C:\Elzano Cox\Projects\dokkit-template-production\04_APPROVED_READY_SINGLE DOCUMENTS"
)
OUTPUT_ROOT = Path(
    r"C:\Elzano Cox\Projects\dokkit\public\images\previews\single-documents"
)

DOCUMENTS = [
    {
        "slug": "business-financial-income-statement-template",
        "title": "Business Financial Income Statement Template",
        "source": SOURCE_ROOT
        / "Excel"
        / "DokKit_Business_Financial_Income_Statement_Template_v1.0.xlsx",
        "format": "Excel",
    },
    {
        "slug": "crm-tracker",
        "title": "CRM Tracker",
        "source": SOURCE_ROOT / "Excel" / "DokKit_CRM_Tracker_v1.xlsx",
        "format": "Excel",
    },
    {
        "slug": "income-and-expense-tracker",
        "title": "Income and Expense Tracker",
        "source": SOURCE_ROOT / "Excel" / "DokKit_Income_and_Expense_Tracker_v1.xlsx",
        "format": "Excel",
    },
    {
        "slug": "invoice-workbook-template",
        "title": "Invoice Workbook Template",
        "source": SOURCE_ROOT / "Excel" / "DokKit_Invoice_Workbook_Template_v1.xlsx",
        "format": "Excel",
    },
    {
        "slug": "fixed-term-employment-contract-template",
        "title": "Fixed-Term Employment Contract Template",
        "source": SOURCE_ROOT
        / "Word"
        / "DokKit_Fixed_Term_Employment_Contract_Template_v1.docx",
        "format": "Word",
    },
    {
        "slug": "general-service-agreement-template",
        "title": "General Service Agreement Template",
        "source": SOURCE_ROOT
        / "Word"
        / "Dokkit_General_Service_Agreement_Template_v1.docx",
        "format": "Word",
    },
    {
        "slug": "joint-venture-structure-agreement-template",
        "title": "Joint Venture Structure Agreement Template",
        "source": SOURCE_ROOT
        / "Word"
        / "DokKit_Joint_Venture_Structure_Agreement_Template_v1.docx",
        "format": "Word",
    },
    {
        "slug": "master-quotation-template",
        "title": "Master Quotation Template",
        "source": SOURCE_ROOT / "Word" / "DokKit_Master_Quotation_Template_v1.docx",
        "format": "Word",
    },
    {
        "slug": "non-disclosure-agreement-template",
        "title": "Non-Disclosure Agreement Template",
        "source": SOURCE_ROOT
        / "Word"
        / "DokKit_Non_Disclosure_Agreement_Template_v1.docx",
        "format": "Word",
    },
    {
        "slug": "popia-privacy-policy-statement-template",
        "title": "POPIA Privacy Policy Statement Template",
        "source": SOURCE_ROOT
        / "Word"
        / "DokKit_POPIA_Privacy_Policy_Statement_Template_v1.docx",
        "format": "Word",
    },
    {
        "slug": "terms-and-conditions-template",
        "title": "Terms and Conditions Template",
        "source": SOURCE_ROOT
        / "Word"
        / "DokKit_Terms_and_Conditions_Template_v1.docx",
        "format": "Word",
    },
    {
        "slug": "vat-compliant-invoice-template",
        "title": "VAT-Compliant Invoice Template",
        "source": SOURCE_ROOT
        / "Word"
        / "DokKit_VAT_Compliant_Invoice_Template_v1.docx",
        "format": "Word",
    },
    {
        "slug": "vat-ready-purchase-order-template",
        "title": "VAT-Ready Purchase Order Template",
        "source": SOURCE_ROOT
        / "Word"
        / "DokKit_VAT_Ready_Purchase_Order_Template_v1.docx",
        "format": "Word",
    },
]

PAGE_W = 1100
PAGE_H = 1420
MARGIN = 90


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


FONT_TITLE = font(38, True)
FONT_LABEL = font(17, True)
FONT_BODY = font(23)
FONT_BODY_BOLD = font(23, True)
FONT_SMALL = font(16)
FONT_WATERMARK = font(72, True)


def clean_text(value: object) -> str:
    text = "" if value is None else str(value)
    return re.sub(r"\s+", " ", text).strip()


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font_obj, max_width: int) -> list[str]:
    words = clean_text(text).split()
    if not words:
        return []

    lines: list[str] = []
    line = words[0]
    for word in words[1:]:
        candidate = f"{line} {word}"
        if draw.textbbox((0, 0), candidate, font=font_obj)[2] <= max_width:
            line = candidate
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def draw_header(draw: ImageDraw.ImageDraw, title: str, file_format: str) -> int:
    draw.rectangle((0, 0, PAGE_W, 128), fill=(17, 17, 17))
    draw.rounded_rectangle((MARGIN, 34, MARGIN + 70, 94), radius=16, fill=(255, 106, 0))
    draw.text((MARGIN + 21, 49), "DK", fill=(255, 255, 255), font=FONT_LABEL)
    draw.text((MARGIN + 92, 34), "DokKit Preview", fill=(255, 176, 111), font=FONT_LABEL)
    draw.text((MARGIN + 92, 60), title, fill=(255, 255, 255), font=FONT_TITLE)
    draw.text((PAGE_W - MARGIN - 90, 55), file_format, fill=(255, 176, 111), font=FONT_LABEL)
    return 178


def draw_watermark(image: Image.Image) -> None:
    overlay = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)
    text = "PREVIEW"
    text_box = draw.textbbox((0, 0), text, font=FONT_WATERMARK)
    text_w = text_box[2] - text_box[0]
    text_h = text_box[3] - text_box[1]
    watermark = Image.new("RGBA", (text_w + 80, text_h + 80), (255, 255, 255, 0))
    watermark_draw = ImageDraw.Draw(watermark)
    watermark_draw.text((40, 40), text, font=FONT_WATERMARK, fill=(255, 106, 0, 42))
    watermark = watermark.rotate(-28, expand=True)
    overlay.alpha_composite(
        watermark,
        ((PAGE_W - watermark.width) // 2, (PAGE_H - watermark.height) // 2),
    )
    image.alpha_composite(overlay)


def draw_footer(draw: ImageDraw.ImageDraw) -> None:
    draw.rectangle((0, PAGE_H - 74, PAGE_W, PAGE_H), fill=(246, 244, 241))
    draw.text(
        (MARGIN, PAGE_H - 48),
        "Preview only. Editable Word and Excel files unlock after verified payment.",
        fill=(95, 95, 102),
        font=FONT_SMALL,
    )


def extract_docx_lines(source: Path) -> list[str]:
    document = Document(source)
    lines: list[str] = []

    for paragraph in document.paragraphs:
        text = clean_text(paragraph.text)
        if text:
            lines.append(text)
        if len(lines) >= 28:
            break

    for table in document.tables:
        for row in table.rows:
            cells = [clean_text(cell.text) for cell in row.cells if clean_text(cell.text)]
            if cells:
                lines.append(" | ".join(cells))
            if len(lines) >= 34:
                return lines

    return lines


def extract_xlsx_rows(source: Path) -> list[list[str]]:
    workbook = load_workbook(source, data_only=True, read_only=True)
    worksheet = workbook[workbook.sheetnames[0]]
    rows: list[list[str]] = []

    for row in worksheet.iter_rows(min_row=1, max_row=22, max_col=6, values_only=True):
        values = [clean_text(value) for value in row]
        if any(values):
            rows.append(values)
        if len(rows) >= 16:
            break

    workbook.close()
    return rows


def create_canvas() -> Image.Image:
    return Image.new("RGBA", (PAGE_W, PAGE_H), (255, 255, 255, 255))


def render_docx_preview(item: dict[str, object]) -> None:
    image = create_canvas()
    draw = ImageDraw.Draw(image)
    y = draw_header(draw, str(item["title"]), "Word")
    lines = extract_docx_lines(Path(str(item["source"])))

    draw.rounded_rectangle(
        (MARGIN, y, PAGE_W - MARGIN, y + 44),
        radius=8,
        fill=(255, 244, 235),
    )
    draw.text((MARGIN + 18, y + 12), "Document extract", fill=(217, 84, 0), font=FONT_LABEL)
    y += 76

    for index, line in enumerate(lines):
        line_font = FONT_BODY_BOLD if index == 0 else FONT_BODY
        max_lines = 2 if index < 6 else 1
        wrapped = wrap_text(draw, line, line_font, PAGE_W - (MARGIN * 2))
        for wrapped_line in wrapped[:max_lines]:
            if y > PAGE_H - 150:
                break
            draw.text((MARGIN, y), wrapped_line, fill=(34, 34, 34), font=line_font)
            y += 34
        y += 8
        if y > PAGE_H - 150:
            break

    draw_watermark(image)
    draw_footer(draw)
    image.convert("RGB").save(OUTPUT_ROOT / f"{item['slug']}.png", quality=92)


def render_xlsx_preview(item: dict[str, object]) -> None:
    image = create_canvas()
    draw = ImageDraw.Draw(image)
    y = draw_header(draw, str(item["title"]), "Excel")
    rows = extract_xlsx_rows(Path(str(item["source"])))

    draw.rounded_rectangle(
        (MARGIN, y, PAGE_W - MARGIN, y + 44),
        radius=8,
        fill=(255, 244, 235),
    )
    draw.text((MARGIN + 18, y + 12), "Workbook extract", fill=(217, 84, 0), font=FONT_LABEL)
    y += 78

    col_widths = [220, 160, 160, 150, 150, 120]
    x0 = MARGIN
    row_h = 54

    for row_index, row in enumerate(rows):
        x = x0
        fill = (246, 244, 241) if row_index == 0 else (255, 255, 255)
        for col_index, width in enumerate(col_widths):
            value = row[col_index] if col_index < len(row) else ""
            draw.rectangle((x, y, x + width, y + row_h), fill=fill, outline=(229, 224, 218))
            if value:
                text = value[:34]
                text_font = FONT_BODY_BOLD if row_index == 0 else FONT_SMALL
                draw.text((x + 12, y + 16), text, fill=(34, 34, 34), font=text_font)
            x += width
        y += row_h
        if y > PAGE_H - 150:
            break

    draw_watermark(image)
    draw_footer(draw)
    image.convert("RGB").save(OUTPUT_ROOT / f"{item['slug']}.png", quality=92)


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    for item in DOCUMENTS:
        source = Path(str(item["source"]))
        if not source.exists():
            raise FileNotFoundError(source)
        if item["format"] == "Word":
            render_docx_preview(item)
        else:
            render_xlsx_preview(item)
        print(f"Created {OUTPUT_ROOT / f'{item['slug']}.png'}")


if __name__ == "__main__":
    main()
