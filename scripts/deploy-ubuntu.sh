#!/bin/bash
# Alias legado — use deploy-brasil-caramelo.sh para opções (--mode, --audit).
set -euo pipefail
cd "$(dirname "$0")/.."
exec bash scripts/deploy-brasil-caramelo.sh "$@"
