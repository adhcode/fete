#!/bin/bash

# Test script for News Feed feature
# Make sure backend is running on localhost:3000

API_URL="http://localhost:3000"
EVENT_CODE="SUMMER24"  # Replace with your test event code
GUEST_ID="guest_test_$(date +%s)"

echo "🧪 Testing News Feed Feature"
echo "================================"
echo ""

# Test 1: Get feed (latest)
echo "1️⃣  Testing GET /api/events/$EVENT_CODE/feed (latest)"
curl -s -X GET "$API_URL/api/events/$EVENT_CODE/feed?sort=latest&limit=5" \
  -H "X-Fete-Guest: $GUEST_ID" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 2: Get feed (trending)
echo "2️⃣  Testing GET /api/events/$EVENT_CODE/feed (trending)"
curl -s -X GET "$API_URL/api/events/$EVENT_CODE/feed?sort=trending&limit=5" \
  -H "X-Fete-Guest: $GUEST_ID" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Get first photo ID from feed
PHOTO_ID=$(curl -s -X GET "$API_URL/api/events/$EVENT_CODE/feed?limit=1" \
  -H "X-Fete-Guest: $GUEST_ID" | jq -r '.items[0].id')

if [ "$PHOTO_ID" != "null" ] && [ -n "$PHOTO_ID" ]; then
  echo "📸 Found photo: $PHOTO_ID"
  echo ""
  
  # Test 3: Like photo
  echo "3️⃣  Testing POST /api/photos/$PHOTO_ID/like"
  curl -s -X POST "$API_URL/api/photos/$PHOTO_ID/like" \
    -H "X-Fete-Guest: $GUEST_ID" \
    -H "Content-Type: application/json" | jq '.'
  echo ""
  
  # Test 4: Like again (idempotent)
  echo "4️⃣  Testing POST /api/photos/$PHOTO_ID/like (idempotent)"
  curl -s -X POST "$API_URL/api/photos/$PHOTO_ID/like" \
    -H "X-Fete-Guest: $GUEST_ID" \
    -H "Content-Type: application/json" | jq '.'
  echo ""
  
  # Test 5: Unlike photo
  echo "5️⃣  Testing DELETE /api/photos/$PHOTO_ID/like"
  curl -s -X DELETE "$API_URL/api/photos/$PHOTO_ID/like" \
    -H "X-Fete-Guest: $GUEST_ID" \
    -H "Content-Type: application/json" | jq '.'
  echo ""
  
  # Test 6: Unlike again (idempotent)
  echo "6️⃣  Testing DELETE /api/photos/$PHOTO_ID/like (idempotent)"
  curl -s -X DELETE "$API_URL/api/photos/$PHOTO_ID/like" \
    -H "X-Fete-Guest: $GUEST_ID" \
    -H "Content-Type: application/json" | jq '.'
  echo ""
else
  echo "⚠️  No photos found in feed. Upload some photos first!"
  echo ""
fi

# Test 7: Missing guest ID (should fail)
echo "7️⃣  Testing POST /api/photos/test/like (missing guest ID - should fail)"
curl -s -X POST "$API_URL/api/photos/test/like" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "✅ Feed tests complete!"
echo ""
echo "💡 Tips:"
echo "  - Make sure backend is running: cd fete-backend && npm run start:dev"
echo "  - Make sure worker is running: cd fete-backend && npm run start:worker"
echo "  - Upload photos via the camera view first"
echo "  - Change EVENT_CODE variable to match your test event"
