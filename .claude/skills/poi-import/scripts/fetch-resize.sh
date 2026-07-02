#!/usr/bin/env bash
# Download an image URL and normalise it to a JPG <= 1 MB (featured_image cap).
# Usage: fetch-resize.sh <url> <output.jpg>
# Prints the final byte size, or "FAILED" if the download produced nothing.
set -euo pipefail
[ $# -eq 2 ] || { echo "usage: fetch-resize.sh <url> <output.jpg>" >&2; exit 1; }
url="$1"; out="$2"
mkdir -p "$(dirname "$out")"
tmp="$(mktemp)"
curl -sL -A "Mozilla/5.0" --max-time 45 "$url" -o "$tmp" || true
if [ ! -s "$tmp" ]; then rm -f "$tmp"; echo "FAILED"; exit 0; fi
# First pass: convert to JPG, cap the long edge at 1600px.
sips -s format jpeg -s formatOptions 82 -Z 1600 "$tmp" --out "$out" >/dev/null 2>&1 || { rm -f "$tmp"; echo "FAILED"; exit 0; }
sz=$(stat -f%z "$out")
# Second pass if still over 1 MB: smaller + lower quality.
if [ "$sz" -gt 1000000 ]; then
  sips -s format jpeg -s formatOptions 60 -Z 1200 "$tmp" --out "$out" >/dev/null 2>&1
  sz=$(stat -f%z "$out")
fi
rm -f "$tmp"
echo "$sz"
