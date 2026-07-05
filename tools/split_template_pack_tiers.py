from __future__ import annotations

import argparse
import json
import re
import shutil
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any


READY_ROOT = Path("C:/Business/TEMPLATES.ZIP/READY")
OUTPUT_ROOT = Path("C:/Business/TEMPLATES.ZIP/TIERED_READY")


@dataclass(frozen=True)
class Tier:
    key: str
    name: str
    template_count: int
    document_count: int


@dataclass(frozen=True)
class Pack:
    source_dir: Path
    folder_prefix: str
    workbook_source: str
    workbook_prefix: str
    workbook_readme_source: str | None
    workbook_readme_target_suffix: str


TIERS = [
    Tier("starter", "Starter", 10, 11),
    Tier("professional", "Professional", 19, 20),
    Tier("complete", "Complete", 33, 34),
]

PACKS = [
    Pack(
        source_dir=READY_ROOT / "DokKit_Beauty_Salons_and_Spas_Complete_Pack_v1",
        folder_prefix="DokKit_Beauty_Salons_and_Spas",
        workbook_source="DokKit_Hair_and_Beauty_Complete_Workbook.xlsx",
        workbook_prefix="DokKit_Beauty_Salons_and_Spas",
        workbook_readme_source="DokKit Workbook Read Me.docx",
        workbook_readme_target_suffix="Read_Me_Beauty_Salons_and_Spas_Workbook.docx",
    ),
    Pack(
        source_dir=READY_ROOT / "DokKit_Catering_and_Baking_Complete_Pack_v1",
        folder_prefix="DokKit_Catering_and_Baking",
        workbook_source="DokKit_Catering_and_Baking_Complete_Workbook_v1.xlsx",
        workbook_prefix="DokKit_Catering_and_Baking",
        workbook_readme_source="34_Read_Me_Catering_and_Baking_Workbook.docx",
        workbook_readme_target_suffix="Read_Me_Catering_and_Baking_Workbook.docx",
    ),
]


def tier_folder_name(pack: Pack, tier: Tier) -> str:
    return f"{pack.folder_prefix}_{tier.name}_Pack_v1"


def tier_workbook_name(pack: Pack, tier: Tier) -> str:
    return f"{pack.workbook_prefix}_{tier.name}_Workbook_v1.xlsx"


def doc_sort_key(pack: Pack, path: Path) -> tuple[int, str]:
    match = re.match(r"^(\d{2})_(.+)\.docx$", path.name, re.IGNORECASE)

    if match:
        return int(match.group(1)), match.group(2)

    if pack.workbook_readme_source and path.name == pack.workbook_readme_source:
        return 34, pack.workbook_readme_target_suffix

    raise ValueError(f"Cannot determine document number for {path}")


def target_doc_name(pack: Pack, source: Path) -> str:
    number, suffix = doc_sort_key(pack, source)

    if not suffix.lower().endswith(".docx"):
        suffix = f"{suffix}.docx"

    return f"{number:02d}_{suffix}"


def target_workbook_readme_name(pack: Pack, tier: Tier) -> str:
    return f"{tier.document_count:02d}_{pack.workbook_readme_target_suffix}"


def tier_replacements(tier: Tier) -> list[tuple[str, str]]:
    return [
        ("Complete Business Document Template Pack", f"{tier.name} Business Document Template Pack"),
        ("Complete Business Template Pack", f"{tier.name} Business Template Pack"),
        ("Complete Document Pack", f"{tier.name} Document Pack"),
        ("Complete Workbook Template", f"{tier.name} Workbook Template"),
        ("Complete Workbook", f"{tier.name} Workbook"),
        ("Complete Package", f"{tier.name} Package"),
        ("Complete Pack", f"{tier.name} Pack"),
        ("Complete_Workbook", f"{tier.name}_Workbook"),
        ("DokKit Catering and Baking Complete ", f"DokKit Catering and Baking {tier.name} "),
        ("DokKit Hair and Beauty Complete ", f"DokKit Hair and Beauty {tier.name} "),
        ("Hair, Beauty and Spa Complete ", f"Hair, Beauty and Spa {tier.name} "),
    ]


def patch_text(text: str, tier: Tier) -> str:
    if tier.key == "complete":
        return text

    patched = text

    for old, new in tier_replacements(tier):
        patched = patched.replace(old, new)

    return patched


def copy_office_file(source: Path, target: Path, tier: Tier) -> None:
    with zipfile.ZipFile(source, "r") as zin:
        with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
            for info in zin.infolist():
                data = zin.read(info.filename)

                if info.filename.endswith(".xml"):
                    try:
                        original_text = data.decode("utf-8")
                    except UnicodeDecodeError:
                        original_text = ""

                    if original_text:
                        data = patch_text(original_text, tier).encode("utf-8")

                zout.writestr(info, data)


def safe_rmtree(path: Path) -> None:
    output_root = OUTPUT_ROOT.resolve()
    resolved = path.resolve()

    if output_root not in [resolved, *resolved.parents]:
        raise ValueError(f"Refusing to remove path outside output root: {resolved}")

    if path.exists():
        shutil.rmtree(path)


def selected_template_docx_files(pack: Pack, tier: Tier) -> list[Path]:
    source_files = sorted(pack.source_dir.glob("*.docx"), key=lambda path: doc_sort_key(pack, path))
    selected = [path for path in source_files if doc_sort_key(pack, path)[0] <= tier.template_count]

    if len(selected) != tier.template_count:
        raise ValueError(
            f"{tier.name} expected {tier.template_count} template documents from {pack.source_dir}, "
            f"but selected {len(selected)}."
        )

    return selected


def split_pack(pack: Pack, tier: Tier, execute: bool) -> dict[str, Any]:
    if not pack.source_dir.exists():
        raise FileNotFoundError(f"Missing source folder: {pack.source_dir}")

    workbook_source = pack.source_dir / pack.workbook_source
    workbook_readme_source = (
        pack.source_dir / pack.workbook_readme_source if pack.workbook_readme_source else None
    )

    if not workbook_source.exists():
        raise FileNotFoundError(f"Missing workbook: {workbook_source}")

    if not workbook_readme_source or not workbook_readme_source.exists():
        raise FileNotFoundError(f"Missing workbook read me: {workbook_readme_source}")

    target_dir = OUTPUT_ROOT / tier_folder_name(pack, tier)
    docs = selected_template_docx_files(pack, tier)
    target_doc_names = [
        *[target_doc_name(pack, doc) for doc in docs],
        target_workbook_readme_name(pack, tier),
    ]

    expected_doc_numbers = [f"{index:02d}_" for index in range(1, tier.document_count + 1)]
    actual_doc_numbers = [name[:3] for name in target_doc_names]

    if actual_doc_numbers != expected_doc_numbers:
        raise ValueError(
            f"Numbering error for {target_dir.name}: expected {expected_doc_numbers}, "
            f"got {actual_doc_numbers}"
        )

    if execute:
        existing_readme = target_dir / target_workbook_readme_name(pack, tier)
        existing_readme_bytes = existing_readme.read_bytes() if existing_readme.exists() else None

        safe_rmtree(target_dir)
        target_dir.mkdir(parents=True, exist_ok=True)

        for doc in docs:
            copy_office_file(doc, target_dir / target_doc_name(pack, doc), tier)

        target_readme = target_dir / target_workbook_readme_name(pack, tier)

        if existing_readme_bytes:
            target_readme.write_bytes(existing_readme_bytes)
        else:
            copy_office_file(workbook_readme_source, target_readme, tier)

        copy_office_file(workbook_source, target_dir / tier_workbook_name(pack, tier), tier)

    return {
        "folder": str(target_dir),
        "tier": tier.key,
        "documents": target_doc_names,
        "workbook": tier_workbook_name(pack, tier),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Split DokKit Complete template packs into Starter, Professional, and Complete tier folders."
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Write tier folders. Without this flag, only validates and prints the plan.",
    )
    args = parser.parse_args()

    results = []

    for pack in PACKS:
        for tier in TIERS:
            results.append(split_pack(pack, tier, args.execute))

    print(json.dumps({"mode": "execute" if args.execute else "dry-run", "packs": results}, indent=2))


if __name__ == "__main__":
    main()
