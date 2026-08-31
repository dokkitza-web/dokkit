"""Create separate public PNG previews from protected trade-pack DOCX/XLSX files."""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
ARCHIVES = ROOT / ".localappdata" / "product-packs"
OUTPUT = ROOT / "public" / "samples" / "trade-packs"
PACKS = {
    "electrical-contractor-pack": ("DokKit_Electrical_Contractor_Pack_v1.0.0.zip", [("quotation", "01_Templates_to_edit/1_Quotation.docx"), ("job-record", "01_Templates_to_edit/2_Job_Record.docx"), ("invoice", "01_Templates_to_edit/3_Invoice_NOT_VAT_registered.docx"), ("admin-workbook", "02_Admin_workbook/Admin_Workbook.xlsx")]),
    "plumbing-contractor-pack": ("DokKit_Plumbing_Contractor_Pack_v1.0.0.zip", [("quotation", "01_Templates_to_edit/1_Quotation.docx"), ("job-record", "01_Templates_to_edit/2_Job_Record.docx"), ("plumbers-report", "01_Templates_to_edit/3_Plumbers_Report_insurance_claims.docx"), ("admin-workbook", "02_Admin_workbook/Admin_Workbook.xlsx")]),
    "solar-installer-pack": ("DokKit_Solar_Installer_Pack_v1.0.0.zip", [("site-assessment", "01_Templates_to_edit/1_Site_Assessment.docx"), ("quotation", "01_Templates_to_edit/2_Quotation.docx"), ("installation-commissioning", "01_Templates_to_edit/3_Installation_and_Commissioning_Record.docx"), ("admin-workbook", "02_Admin_workbook/Admin_Workbook.xlsx")]),
    "electric-fence-installer-pack": ("DokKit_Electric_Fence_Installer_Pack_v1.0.0.zip", [("quotation", "01_Templates_to_edit/1_Quotation.docx"), ("installation-record", "01_Templates_to_edit/2_Installation_Record.docx"), ("inspection-certification-report", "01_Templates_to_edit/3_Inspection_and_Certification_Report.docx"), ("admin-workbook", "02_Admin_workbook/Admin_Workbook.xlsx")]),
}


def tool(name: str, fallbacks: tuple[str, ...] = ()) -> str:
    for candidate in (shutil.which(name), *fallbacks):
        if candidate and Path(candidate).exists():
            return candidate
    raise RuntimeError(f"{name} is required to render actual source previews.")


def font(size: int, bold: bool = False):
    path = Path(r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf")
    return ImageFont.truetype(path, size) if path.exists() else ImageFont.load_default()


def render_first_page(source: Path, work: Path) -> Path:
    soffice = tool("soffice", (r"C:\Program Files\LibreOffice\program\soffice.exe", r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"))
    pdftoppm = tool("pdftoppm")
    profile, pdf_dir = work / "profile", work / "pdf"
    profile.mkdir(parents=True, exist_ok=True)
    pdf_dir.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env.update({"HOME": str(profile), "XDG_CONFIG_HOME": str(profile / "config"), "XDG_CACHE_HOME": str(profile / "cache")})
    subprocess.run([soffice, f"-env:UserInstallation={profile.resolve().as_uri()}", "--invisible", "--headless", "--norestore", "--convert-to", "pdf", "--outdir", str(pdf_dir), str(source)], check=True, capture_output=True, text=True, env=env)
    pdf = pdf_dir / f"{source.stem}.pdf"
    if not pdf.exists():
        raise RuntimeError(f"LibreOffice did not render {source.name}")
    prefix = work / "page"
    subprocess.run([pdftoppm, "-png", "-f", "1", "-l", "1", "-r", "144", str(pdf), str(prefix)], check=True, capture_output=True, text=True)
    return next(work.glob("page-*.png"))


def watermark(source: Path, destination: Path) -> None:
    page = Image.open(source).convert("RGBA")
    if page.width > 1200:
        page = page.resize((1200, round(page.height * 1200 / page.width)), Image.Resampling.LANCZOS)
    overlay = Image.new("RGBA", page.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)
    label = "DOKKIT SAMPLE - NOT FOR USE"
    for y in (page.height // 4, page.height * 3 // 5):
        draw.text((page.width // 14, y), label, font=font(max(30, page.width // 23), True), fill=(190, 62, 0, 105), stroke_width=1, stroke_fill=(255, 255, 255, 70))
    output = Image.alpha_composite(page, overlay.rotate(24, resample=Image.Resampling.BICUBIC))
    footer_height = max(42, page.height // 25)
    footer = ImageDraw.Draw(output)
    footer.rectangle((0, output.height - footer_height, output.width, output.height), fill=(17, 17, 17, 238))
    footer.text((max(18, page.width // 30), output.height - footer_height + max(11, footer_height // 4)), "Preview copy - Purchase required for editable files - dokkit.co.za", font=font(max(13, page.width // 72)), fill="white")
    output.convert("RGB").save(destination, "PNG", optimize=True)


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="dokkit-trade-samples-") as temporary:
        temp = Path(temporary)
        for slug, (archive_name, samples) in PACKS.items():
            archive = ARCHIVES / archive_name
            if not archive.exists():
                raise RuntimeError(f"Missing delivery archive: {archive}")
            destination = OUTPUT / slug
            destination.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(archive) as zip_file:
                for sample_id, member_suffix in samples:
                    member = next((name for name in zip_file.namelist() if name.endswith(member_suffix)), None)
                    if not member:
                        raise RuntimeError(f"{member_suffix} is missing from {archive.name}")
                    work = temp / slug / sample_id
                    work.mkdir(parents=True, exist_ok=True)
                    source = work / Path(member_suffix).name
                    source.write_bytes(zip_file.read(member))
                    watermark(render_first_page(source, work), destination / f"{sample_id}-sample.png")
    print("Generated 16 watermarked previews from the actual protected trade-pack templates.")


if __name__ == "__main__":
    main()
