#!/usr/bin/env python3
"""Generate simple PNG app icons without extra dependencies."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path


def png(width: int, height: int, pixel) -> bytes:
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixel(x, y, width, height))
    return b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)),
            chunk(b"IDAT", zlib.compress(bytes(raw), 9)),
            chunk(b"IEND", b""),
        ]
    )


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def icon_pixel(x: int, y: int, width: int, height: int, pad: bool) -> bytes:
    nx = x / (width - 1)
    ny = y / (height - 1)
    if pad:
        margin = 0.08
        if nx < margin or ny < margin or nx > 1 - margin or ny > 1 - margin:
            return bytes((196, 92, 38))
    cx, cy = 0.5, 0.53
    dx = nx - cx
    dy = ny - cy
    dist = (dx * dx + dy * dy) ** 0.5
    if 0.22 < dist < 0.28:
        return bytes((255, 253, 248))
    if dist < 0.09:
        return bytes((244, 236, 226))
    if 0.36 < nx < 0.64 and 0.18 < ny < 0.24:
        return bytes((255, 253, 248))
    return bytes((196, 92, 38))


def write(path: Path, size: int, pad: bool) -> None:
    path.write_bytes(png(size, size, lambda x, y, w, h: icon_pixel(x, y, w, h, pad)))


def main() -> None:
    out = Path("public/icons")
    out.mkdir(parents=True, exist_ok=True)
    write(out / "icon-192.png", 192, False)
    write(out / "icon-512.png", 512, False)
    write(out / "icon-maskable-512.png", 512, True)


if __name__ == "__main__":
    main()
