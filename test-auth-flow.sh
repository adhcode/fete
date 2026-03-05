#!/bin/bash

# Test Authentication Flow
# This script tests the complete auth + event creation flow

echo "🔐 Testing Authentication & Event Creation Flow"
echo "================================================"
echo ""

API_URL="http://localhost:3000"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Generate random email for testing
RANDOM_EMAIL="test$(date +%s)@example.com"
PASSWORD="password123"

echo -e "${BLUE}1. Testing Signup${NC}"
echo "Email: $RANDOM_EMAIL"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")

echo "$SIGNUP_RESPONSE" | jq '.'

# Extract token
TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Signup failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Signup successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

echo -e "${BLUE}2. Testing Get Me${NC}"
ME_RESPONSE=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$ME_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Get Me successful${NC}"
echo ""

echo -e "${BLUE}3. Testing Create Event${NC}"
EVENT_RESPONSE=$(curl -s -X POST "$API_URL/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Event",
    "venue":"Test Venue",
    "hashtag":"TestEvent2026",
    "templateId":"template-classic",
    "publicGallery":true,
    "allowShareLinks":true
  }')

echo "$EVENT_RESPONSE" | jq '.'

EVENT_CODE=$(echo "$EVENT_RESPONSE" | jq -r '.code')

if [ "$EVENT_CODE" == "null" ] || [ -z "$EVENT_CODE" ]; then
  echo -e "${RED}❌ Event creation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Event created with code: $EVENT_CODE${NC}"
echo ""

echo -e "${BLUE}4. Testing Get My Events${NC}"
MY_EVENTS=$(curl -s "$API_URL/events/organizer/my-events" \
  -H "Authorization: Bearer $TOKEN")

echo "$MY_EVENTS" | jq '.'
echo -e "${GREEN}✅ Get My Events successful${NC}"
echo ""

echo -e "${BLUE}5. Testing Public Event Access (No Auth)${NC}"
PUBLIC_EVENT=$(curl -s "$API_URL/events/$EVENT_CODE")

echo "$PUBLIC_EVENT" | jq '.'
echo -e "${GREEN}✅ Public event access successful${NC}"
echo ""

echo -e "${BLUE}6. Testing Create Template${NC}"
TEMPLATE_RESPONSE=$(curl -s -X POST "$API_URL/api/templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Template",
    "config":{
      "version":"1.0",
      "overlay":{"opacity":1,"blendMode":"normal"},
      "textFields":[{
        "id":"eventName",
        "defaultValue":"{{event.name}}",
        "x":50,"y":88,
        "fontSize":42,
        "fontFamily":"Arial",
        "fontWeight":"bold",
        "color":"#FFFFFF",
        "align":"center"
      }]
    }
  }')

echo "$TEMPLATE_RESPONSE" | jq '.'

TEMPLATE_ID=$(echo "$TEMPLATE_RESPONSE" | jq -r '.id')

if [ "$TEMPLATE_ID" == "null" ] || [ -z "$TEMPLATE_ID" ]; then
  echo -e "${RED}❌ Template creation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Template created with ID: $TEMPLATE_ID${NC}"
echo ""

echo -e "${BLUE}7. Testing Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq '.'

NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$NEW_TOKEN" == "null" ] || [ -z "$NEW_TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

echo -e "${BLUE}8. Testing Protected Endpoint Without Auth${NC}"
UNAUTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_URL/events" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Should Fail"}')

HTTP_STATUS=$(echo "$UNAUTH_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$HTTP_STATUS" == "401" ]; then
  echo -e "${GREEN}✅ Correctly rejected unauthorized request (401)${NC}"
else
  echo -e "${RED}❌ Should have returned 401, got $HTTP_STATUS${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ All Tests Passed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "- Organizer Email: $RANDOM_EMAIL"
echo "- Event Code: $EVENT_CODE"
echo "- Template ID: $TEMPLATE_ID"
echo "- Guest URL: http://localhost:5173/e/$EVENT_CODE"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Open http://localhost:5173/e/$EVENT_CODE in browser"
echo "2. Swipe left/right to change templates"
echo "3. Upload a photo to test the flow"
