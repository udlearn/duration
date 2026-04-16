#!/usr/bin/env python3
"""Run test/fixtures/cli_vectors.json against scripts/duration (POSIX shell CLI)."""
from __future__ import annotations

import json
import math
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VEC = ROOT / "test" / "fixtures" / "cli_vectors.json"
CLI = ROOT / "scripts" / "duration"


def almost_equal(a: float, b: float) -> bool:
    if a == b:
        return True
    d = abs(a - b)
    if d < 1e-12:
        return True
    scale = max(1.0, abs(a), abs(b))
    return d / scale < 1e-12


def main() -> int:
    data = json.loads(VEC.read_text())
    for i, c in enumerate(data["cases"]):
        if c.get("skip_shell"):
            continue
        env = os.environ.copy()
        for k, v in c.get("env", {}).items():
            env[k] = str(v)
        proc = subprocess.run(
            [str(CLI), *c["args"]],
            cwd=str(ROOT),
            env=env,
            capture_output=True,
            text=True,
        )
        if proc.returncode != c["exit"]:
            print(f"case {i} exit want {c['exit']} got {proc.returncode}", file=sys.stderr)
            print(proc.stdout, proc.stderr, file=sys.stderr)
            return 1
        out = proc.stdout
        if c["exit"] != 0:
            msg = proc.stderr
            if "stderr_contains" in c and c["stderr_contains"] not in msg:
                print(f"case {i} stderr {msg!r} missing {c['stderr_contains']!r}", file=sys.stderr)
                return 1
            continue
        if "stdout" in c and out != c["stdout"]:
            print(f"case {i} stdout mismatch\n got {out!r}\nwant {c['stdout']!r}", file=sys.stderr)
            return 1
        if "stdout_contains" in c and c["stdout_contains"] not in out:
            print(f"case {i} stdout missing substring", file=sys.stderr)
            return 1
        if "stdout_json" in c:
            got = json.loads(out.strip())
            for k, want in c["stdout_json"].items():
                if k not in got or not almost_equal(float(got[k]), float(want)):
                    print(f"case {i} json {k} want {want} got {got.get(k)}", file=sys.stderr)
                    return 1
    print("all shell vector cases passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
