from __future__ import annotations

import argparse
import csv
import json
import math
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader


DEFAULT_ROOT = Path(r"C:\Business\TEMPLATES.ZIP\NOT_READY\Generated_Industry_Packs_From_Cleaning_Blueprint_20260628_08")
DEFAULT_SOFFICE = Path(r"C:\Program Files\LibreOffice\program\soffice.exe")
DEFAULT_POPPLER = Path(r"C:\Users\Elzano Cox\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin")


@dataclass
class RenderRow:
    source: str
    kind: str
    pdf: str
    status: str
    pages: int | str
    size_bytes: int
    seconds: float
    note: str


def safe_rel(rel: Path) -> Path:
    parts = [re.sub(r"[^A-Za-z0-9._ -]+", "_", p) for p in rel.parts]
    return Path(*parts)


def run(cmd: list[str], timeout: int) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, text=True, capture_output=True, timeout=timeout)


def uri_for_windows_path(path: Path) -> str:
    return path.resolve().as_uri()


def find_office_files(root: Path) -> list[Path]:
    return sorted(
        p
        for p in root.rglob("*")
        if p.is_file() and p.suffix.lower() in {".docx", ".xlsx"} and not p.name.startswith("~$")
    )


def pdf_pages(pdf: Path) -> tuple[int | str, str]:
    try:
        reader = PdfReader(str(pdf))
        return len(reader.pages), ""
    except Exception as exc:
        return "", f"pypdf page count failed: {exc}"


def convert_one(
    soffice: Path,
    profile_dir: Path,
    source: Path,
    root: Path,
    pdf_root: Path,
    timeout: int,
) -> RenderRow:
    rel = safe_rel(source.relative_to(root))
    outdir = pdf_root / rel.parent
    outdir.mkdir(parents=True, exist_ok=True)
    expected_pdf = outdir / f"{source.stem}.pdf"
    if expected_pdf.exists() and expected_pdf.stat().st_size > 0:
        pages, note = pdf_pages(expected_pdf)
        return RenderRow(str(source), source.suffix.lower(), str(expected_pdf), "ok_cached", pages, expected_pdf.stat().st_size, 0.0, note)

    cmd = [
        str(soffice),
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--norestore",
        "--invisible",
        f"-env:UserInstallation={uri_for_windows_path(profile_dir)}",
        "--convert-to",
        "pdf",
        "--outdir",
        str(outdir),
        str(source),
    ]
    import time

    started = time.time()
    try:
        result = run(cmd, timeout=timeout)
        seconds = time.time() - started
    except subprocess.TimeoutExpired:
        return RenderRow(str(source), source.suffix.lower(), str(expected_pdf), "timeout", "", 0, timeout, "LibreOffice conversion timed out")
    except Exception as exc:
        return RenderRow(str(source), source.suffix.lower(), str(expected_pdf), "error", "", 0, time.time() - started, str(exc))

    note = " ".join((result.stdout or "", result.stderr or "")).strip()
    if not expected_pdf.exists():
        candidates = list(outdir.glob("*.pdf"))
        if len(candidates) == 1:
            expected_pdf = candidates[0]
    if result.returncode != 0 or not expected_pdf.exists() or expected_pdf.stat().st_size == 0:
        size = expected_pdf.stat().st_size if expected_pdf.exists() else 0
        return RenderRow(str(source), source.suffix.lower(), str(expected_pdf), "failed", "", size, seconds, note[:1000])

    pages, page_note = pdf_pages(expected_pdf)
    return RenderRow(str(source), source.suffix.lower(), str(expected_pdf), "ok", pages, expected_pdf.stat().st_size, seconds, page_note or note[:500])


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def render_first_page(pdftoppm: Path, pdf: Path, outdir: Path, timeout: int = 45) -> Path | None:
    outdir.mkdir(parents=True, exist_ok=True)
    prefix = outdir / pdf.stem
    png = outdir / f"{pdf.stem}-1.png"
    if png.exists() and png.stat().st_size > 0:
        return png
    try:
        result = run([str(pdftoppm), "-f", "1", "-l", "1", "-r", "55", "-png", str(pdf), str(prefix)], timeout=timeout)
    except Exception:
        return None
    if result.returncode == 0 and png.exists() and png.stat().st_size > 0:
        return png
    return None


def make_contact_sheet(items: list[tuple[str, Path]], target: Path) -> None:
    if not items:
        return
    thumb_w, thumb_h = 190, 245
    label_h = 44
    gap = 14
    cols = 6
    rows = math.ceil(len(items) / cols)
    sheet_w = gap + cols * (thumb_w + gap)
    sheet_h = 58 + rows * (thumb_h + label_h + gap) + gap
    image = Image.new("RGB", (sheet_w, sheet_h), "white")
    draw = ImageDraw.Draw(image)
    title_font = load_font(22, bold=True)
    label_font = load_font(10)
    draw.text((gap, 14), target.stem.replace("_", " "), fill="#111111", font=title_font)
    for index, (label, png_path) in enumerate(items):
        col = index % cols
        row = index // cols
        x = gap + col * (thumb_w + gap)
        y = 58 + row * (thumb_h + label_h + gap)
        try:
            with Image.open(png_path) as src:
                src = src.convert("RGB")
                src.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                frame = Image.new("RGB", (thumb_w, thumb_h), "#f6f6f6")
                ox = (thumb_w - src.width) // 2
                oy = (thumb_h - src.height) // 2
                frame.paste(src, (ox, oy))
        except Exception:
            frame = Image.new("RGB", (thumb_w, thumb_h), "#ffd7d7")
        image.paste(frame, (x, y))
        draw.rectangle((x, y, x + thumb_w, y + thumb_h), outline="#cccccc")
        words = re.sub(r"[_-]+", " ", Path(label).stem)
        words = words[:70]
        draw.multiline_text((x, y + thumb_h + 5), words, fill="#222222", font=label_font, spacing=2)
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, quality=92)


def build_contact_sheets(rows: Iterable[RenderRow], root: Path, qa_root: Path, pdftoppm: Path) -> list[str]:
    png_root = qa_root / "first_page_png"
    sheet_root = qa_root / "contact_sheets"
    by_pack: dict[str, list[tuple[str, Path]]] = {}
    for row in rows:
        if not str(row.status).startswith("ok") or not row.pdf:
            continue
        pdf = Path(row.pdf)
        try:
            source_rel = Path(row.source).relative_to(root)
        except ValueError:
            source_rel = Path(row.source).name
        pack = source_rel.parts[0] if len(source_rel.parts) > 1 else "root"
        png = render_first_page(pdftoppm, pdf, png_root / pack)
        if png:
            by_pack.setdefault(pack, []).append((source_rel.name, png))
    made = []
    for pack, items in sorted(by_pack.items()):
        target = sheet_root / f"{pack}.jpg"
        make_contact_sheet(items, target)
        made.append(str(target))
    return made


def write_csv(rows: list[RenderRow], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(RenderRow.__dataclass_fields__.keys()))
        writer.writeheader()
        for row in rows:
            writer.writerow(row.__dict__)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT)
    parser.add_argument("--soffice", type=Path, default=DEFAULT_SOFFICE)
    parser.add_argument("--poppler", type=Path, default=DEFAULT_POPPLER)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--timeout", type=int, default=180)
    parser.add_argument("--skip-contact-sheets", action="store_true")
    args = parser.parse_args()

    root = args.root
    soffice = args.soffice
    pdftoppm = args.poppler / "pdftoppm.exe"
    if not root.exists():
        raise SystemExit(f"Root not found: {root}")
    if not soffice.exists():
        raise SystemExit(f"LibreOffice not found: {soffice}")
    if not pdftoppm.exists():
        raise SystemExit(f"pdftoppm not found in: {args.poppler}")

    qa_root = root.parent / f"{root.name}_render_QA"
    pdf_root = qa_root / "pdf"
    profile_dir = qa_root / "lo_profile"
    profile_dir.mkdir(parents=True, exist_ok=True)
    files = find_office_files(root)
    if args.limit:
        files = files[: args.limit]

    rows: list[RenderRow] = []
    for index, source in enumerate(files, start=1):
        row = convert_one(soffice, profile_dir, source, root, pdf_root, args.timeout)
        rows.append(row)
        if index % 25 == 0 or row.status not in {"ok", "ok_cached"}:
            print(f"{index}/{len(files)} {row.status}: {source.name}", flush=True)
        write_csv(rows, qa_root / "render_summary_partial.csv")

    write_csv(rows, qa_root / "render_summary.csv")
    status_counts: dict[str, int] = {}
    total_pages = 0
    for row in rows:
        status_counts[row.status] = status_counts.get(row.status, 0) + 1
        if isinstance(row.pages, int):
            total_pages += row.pages

    sheets: list[str] = []
    if not args.skip_contact_sheets:
        sheets = build_contact_sheets(rows, root, qa_root, pdftoppm)

    summary = {
        "qa_root": str(qa_root),
        "source_root": str(root),
        "files": len(rows),
        "status_counts": status_counts,
        "total_pdf_pages": total_pages,
        "contact_sheets": len(sheets),
        "summary_csv": str(qa_root / "render_summary.csv"),
    }
    (qa_root / "render_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))
    return 0 if set(status_counts) <= {"ok", "ok_cached"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
