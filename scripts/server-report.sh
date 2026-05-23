#!/bin/bash
# Alias legado — use server-audit.sh (relatório completo unificado).
exec "$(cd "$(dirname "$0")" && pwd)/server-audit.sh" "$@"
