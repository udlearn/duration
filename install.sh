#!/usr/bin/env sh
# Delegate to scripts/install.sh so the repo root stays a stable curl | sh entrypoint.
exec "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/scripts/install.sh" "$@"
