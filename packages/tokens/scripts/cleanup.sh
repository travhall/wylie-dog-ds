#!/bin/bash
# Generated cleanup script for Wylie Dog tokens
echo "🧹 Cleaning up unnecessary files..."

rm debug-tokens.json.backup
rm src/tokens.generated.ts

echo "✅ Cleanup completed!"
