#!/usr/bin/env python3
"""Convert images in a folder to JPEG files in a sibling output folder.

Usage:
    python tools/heic_to_jpg.py /path/to/photos
    python tools/heic_to_jpg.py /path/to/photos --recursive
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener


register_heif_opener()

IMAGE_EXTENSIONS = {
    ".bmp",
    ".gif",
    ".heic",
    ".heif",
    ".jpeg",
    ".jpg",
    ".png",
    ".tif",
    ".tiff",
    ".webp",
}


def image_files(folder: Path, recursive: bool) -> Iterable[Path]:
    pattern = "**/*" if recursive else "*"
    return (
        path
        for path in folder.glob(pattern)
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )


def jpg_name(source: Path, output_folder: Path) -> Path:
    candidate = output_folder / f"{source.stem}.jpg"
    suffix = 2
    while candidate.exists():
        candidate = output_folder / f"{source.stem}_{suffix}.jpg"
        suffix += 1
    return candidate


def convert_image(source: Path, destination: Path) -> None:
    with Image.open(source) as image:
        image.load()
        if image.mode in {"RGBA", "LA"} or "transparency" in image.info:
            rgba = ImageOps.exif_transpose(image).convert("RGBA")
            background = Image.new("RGB", rgba.size, "white")
            background.paste(rgba, mask=rgba.getchannel("A"))
            converted = background
        else:
            converted = ImageOps.exif_transpose(image).convert("RGB")

        try:
            converted.save(destination, "JPEG", quality=95, optimize=True)
        finally:
            if converted is not image:
                converted.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert images in a folder to JPG files in a sibling folder."
    )
    parser.add_argument("folder", type=Path, help="Folder containing the source images")
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Also convert images in subfolders, preserving their structure",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace matching JPG files already in the output folder",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    folder = args.folder.expanduser().resolve()

    if not folder.is_dir():
        print(f"Error: folder does not exist: {folder}")
        return 2

    output_folder = folder.parent / f"{folder.name}-jpg"
    output_folder.mkdir(exist_ok=True)

    converted_count = 0
    failed_count = 0

    for source in sorted(image_files(folder, args.recursive)):
        relative_parent = source.parent.relative_to(folder) if args.recursive else Path()
        destination_folder = output_folder / relative_parent
        destination_folder.mkdir(parents=True, exist_ok=True)
        destination = destination_folder / f"{source.stem}.jpg"

        if destination.exists() and not args.overwrite:
            destination = jpg_name(source, destination_folder)

        try:
            convert_image(source, destination)
            converted_count += 1
            print(f"Converted: {source} -> {destination}")
        except Exception as error:  # Keep processing the remaining images.
            failed_count += 1
            print(f"Failed: {source} ({error})")

    print(
        f"Done: {converted_count} converted, "
        f"{failed_count} failed. Output: {output_folder}"
    )
    return 1 if failed_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
