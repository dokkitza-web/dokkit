from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "supabase" / "template-packs.json"


def load_config(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def selected_packs(config: dict[str, Any], slugs: set[str]) -> list[dict[str, Any]]:
    packs = config.get("packs", [])

    if not slugs:
        return packs

    return [pack for pack in packs if pack["slug"] in slugs]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()


def package_pack(pack: dict[str, Any], output_dir: Path) -> dict[str, Any]:
    source_dir = Path(pack["sourceDir"])

    if not source_dir.exists() or not source_dir.is_dir():
        raise FileNotFoundError(f"Source pack folder not found: {source_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)
    archive_path = output_dir / pack["archiveName"]
    source_files = sorted(path for path in source_dir.rglob("*") if path.is_file())

    if not source_files:
        raise FileNotFoundError(f"Source pack folder has no files: {source_dir}")

    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for source_file in source_files:
            archive.write(source_file, source_dir.name / source_file.relative_to(source_dir))

    return {
        "slug": pack["slug"],
        "archive": str(archive_path),
        "sourceDir": str(source_dir),
        "fileCount": len(source_files),
        "sizeBytes": archive_path.stat().st_size,
        "sha256": sha256(archive_path),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Package DokKit template pack folders into upload-ready ZIP files.")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--slug", action="append", default=[], help="Package only this product slug. Can be repeated.")
    args = parser.parse_args()

    config = load_config(args.config)
    output_dir = ROOT / config.get("outputDir", ".localappdata/product-packs")
    slugs = set(args.slug)
    packs = selected_packs(config, slugs)

    if not packs:
        raise SystemExit("No template packs matched the requested slug filter.")

    results = [package_pack(pack, output_dir) for pack in packs]
    manifest = {
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "config": str(args.config),
        "outputDir": str(output_dir),
        "packs": results,
    }
    manifest_path = output_dir / "packaging-manifest.json"

    with manifest_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
