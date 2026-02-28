#!/bin/bash

# Template System Testing Script

API_URL="http://localhost:3000"

echo "🧪 Testing Template System"
echo "=========================="
echo ""

# Test 1: List templates
echo "1️⃣  Testing GET /api/templates"
curl -s "$API_URL/api/templates" | jq '.'
echo ""

# Test 2: Get specific template
echo "2️⃣  Testing GET /api/templates/template-classic"
curl -s "$API_URL/api/templates/template-classic" | jq '.'
echo ""

# Test 3: Get event with template
echo "3️⃣  Testing GET /events/AB3X9K (should include template)"
curl -s "$API_URL/events/AB3X9K" | jq '.template'
echo ""

echo "✅ Template system tests complete!"
echo ""
echo "Next steps:"
echo "1. Start backend: cd fete-backend && npm run start:dev"
echo "2. Start frontend: cd fete-web && npm run dev"
echo "3. Visit: http://localhost:5173/e/AB3X9K"
echo "4. Verify template overlay appears on camera"
