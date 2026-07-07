#!/bin/sh
set -e

# Dewey — agent-ready documentation toolkit
# https://dewey.arach.dev

BOLD="\033[1m"
DIM="\033[2m"
RESET="\033[0m"
GREEN="\033[32m"

echo ""
echo "${BOLD}dewey${RESET} ${DIM}— agent-ready documentation${RESET}"
echo ""

# Detect package manager
if command -v bun >/dev/null 2>&1; then
  PM="bunx"
elif command -v pnpm >/dev/null 2>&1; then
  PM="pnpm dlx"
elif command -v npx >/dev/null 2>&1; then
  PM="npx"
else
  echo "Error: No supported package manager found (bun, pnpm, or npm)."
  echo "Install one of these first, then run this script again."
  exit 1
fi

echo "${DIM}Using ${RESET}${BOLD}${PM}${RESET}"
echo ""

# Run dewey init
$PM dewey init

echo ""
echo "${GREEN}✓${RESET} Done. Run ${BOLD}${PM} dewey generate${RESET} to create agent files."
echo ""
