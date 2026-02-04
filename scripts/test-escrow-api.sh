#!/bin/bash

# Quick API Testing Script for Escrow Payment System
# Usage: ./scripts/test-escrow-api.sh

BASE_URL="http://localhost:3000"

echo "🧪 Escrow Payment System API Tests"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Server not running. Start with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}\n"

echo "Note: You'll need to:"
echo "1. Create test users (parent@test.com, tutor@test.com)"
echo "2. Get auth tokens from Firebase"
echo "3. Create a booking first"
echo ""
echo "Then you can test:"
echo ""
echo "Test Tutor Confirmation:"
echo "curl -X POST $BASE_URL/api/bookings/{bookingId}/confirm \\"
echo "  -H 'Authorization: Bearer {tutor_token}'"
echo ""
echo "Test Parent Confirmation:"
echo "curl -X POST $BASE_URL/api/bookings/{bookingId}/confirm \\"
echo "  -H 'Authorization: Bearer {parent_token}'"
echo ""
echo "Test Dispute:"
echo "curl -X POST $BASE_URL/api/bookings/{bookingId}/dispute \\"
echo "  -H 'Authorization: Bearer {token}' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"reason\": \"Test dispute\"}'"
echo ""
echo "Test Auto-Release:"
echo "curl -X POST $BASE_URL/api/bookings/auto-release"
echo ""

