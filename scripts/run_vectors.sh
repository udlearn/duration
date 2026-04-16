#!/usr/bin/env sh
# Run CLI golden vectors against scripts/duration (requires python3).
set -e
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
exec python3 "$ROOT/scripts/run_vectors.py"
