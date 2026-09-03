#!/bin/bash
# Valida formato de scripts/smoke-tests*.list (CI R-OPS-01)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ERR=0
for file in scripts/smoke-tests.list scripts/smoke-tests-auth.list; do
  [ -f "$file" ] || continue
  echo "→ $file"
  line_no=0
  while IFS= read -r line || [ -n "$line" ]; do
    line_no=$((line_no + 1))
    trimmed="${line%%#*}"
    trimmed="$(echo "$trimmed" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [ -z "$trimmed" ] && continue
    fields="$(echo "$trimmed" | awk -F'|' '{print NF}')"
    if [ "$fields" -lt 5 ]; then
      echo "  [ERRO] linha $line_no: esperado category|name|METHOD|path|codes (|$fields campos)"
      ERR=1
    fi
  done < "$file"
done

if [ "$ERR" -ne 0 ]; then
  exit 1
fi
echo "Smoke lists OK."
