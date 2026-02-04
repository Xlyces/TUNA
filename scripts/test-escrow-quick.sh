#!/bin/bash

# Quick Escrow Testing Helper
# Usage: ./scripts/test-escrow-quick.sh

echo "🧪 Escrow Payment System - Quick Test Helper"
echo "=============================================="
echo ""

# Check if dev server is running
echo "Checking dev server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Dev server is running at http://localhost:3000"
else
    echo "❌ Dev server not running"
    echo "   Start with: npm run dev"
    exit 1
fi

echo ""
echo "📋 Test Users (from seed script):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Parent: demo3@tuna.com / demo123"
echo "Tutor:  demo1@tuna.com / demo123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔗 Quick Links:"
echo "  - App: http://localhost:3000"
echo "  - Firebase Emulator UI: http://localhost:4000"
echo "  - Firestore: http://localhost:4000/firestore"
echo "  - Auth: http://localhost:4000/auth"
echo ""

echo "📝 Testing Steps:"
echo "  1. Login as parent (demo3@tuna.com)"
echo "  2. Create a booking"
echo "  3. Complete payment (test card: 4242 4242 4242 4242)"
echo "  4. Check Firestore - booking should have status: 'payment_held'"
echo "  5. Login as tutor (demo1@tuna.com)"
echo "  6. Confirm booking completion"
echo "  7. Login as parent again"
echo "  8. Confirm booking completion"
echo "  9. Check Firestore - status should be 'completed', paymentCaptured: true"
echo ""

echo "🧪 API Testing:"
echo ""
echo "Get auth token from browser console after login:"
echo "  await firebase.auth().currentUser.getIdToken()"
echo ""
echo "Then test endpoints:"
echo ""
echo "Tutor Confirm:"
echo "  curl -X POST http://localhost:3000/api/bookings/{bookingId}/confirm \\"
echo "    -H 'Authorization: Bearer {tutor_token}'"
echo ""
echo "Parent Confirm:"
echo "  curl -X POST http://localhost:3000/api/bookings/{bookingId}/confirm \\"
echo "    -H 'Authorization: Bearer {parent_token}'"
echo ""
echo "Auto-Release:"
echo "  curl -X POST http://localhost:3000/api/bookings/auto-release"
echo ""

