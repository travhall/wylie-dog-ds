#!/bin/bash

# Performance Check Script for Wylie Dog Design System
# Runs local performance checks before pushing

set -e

echo "🚀 Starting performance checks..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Bundle Size Check
echo "${YELLOW}📦 Checking bundle sizes...${NC}"
pnpm size
echo "${GREEN}✓ Bundle size check complete${NC}"
echo ""

# 2. Build Performance Check
echo "${YELLOW}⚡ Checking build performance...${NC}"
time pnpm build
echo "${GREEN}✓ Build performance check complete${NC}"
echo ""

# 3. Optional: Lighthouse CI (requires running Storybook)
if command -v lhci &> /dev/null; then
    echo "${YELLOW}🔍 Running Lighthouse CI (optional)...${NC}"
    echo "Make sure Storybook is running on http://localhost:6006"
    echo "Run 'pnpm --filter storybook dev' in another terminal if not already running"
    read -p "Press enter to continue with Lighthouse CI or Ctrl+C to skip... "

    # Build Storybook if not already built
    if [ ! -d "apps/storybook/storybook-static" ]; then
        echo "Building Storybook..."
        pnpm --filter storybook build
    fi

    # Run Lighthouse CI
    lhci autorun
    echo "${GREEN}✓ Lighthouse CI check complete${NC}"
else
    echo "${YELLOW}ℹ Lighthouse CI not installed. Install with: npm i -g @lhci/cli${NC}"
fi

echo ""
echo "${GREEN}✅ All performance checks complete!${NC}"
