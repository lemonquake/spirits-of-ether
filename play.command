#!/bin/bash
cd "$(dirname "$0")"
export PATH="/Users/lemonquake/.nvm/versions/node/v24.15.0/bin:$PATH"
echo "========================================================="
echo "   Starting Spirits of Ether...                          "
echo "========================================================="
echo ""
npm run dev
