#!/usr/bin/env bash
# Convert a list image (HEIC or anything sips reads) to JPG for Read.
# Usage: prepare-image.sh <input> <output.jpg>
set -euo pipefail
[ $# -eq 2 ] || { echo "usage: prepare-image.sh <input> <output.jpg>" >&2; exit 1; }
sips -s format jpeg "$1" --out "$2" >/dev/null
echo "$2"
