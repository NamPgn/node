#!/bin/bash

# Script test gửi push notification KHÔNG CẦN LOGIN
# Chạy: bash test-send-notification.sh

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Config
API_URL="http://localhost:8080/api/notification/send"
SECRET_KEY="your-secret-key-here"  # Thay bằng key trong .env

echo -e "${GREEN}🔔 Testing Push Notification - No Login Required${NC}\n"

# Test 1: Send custom notification to all
echo -e "${YELLOW}📤 Test 1: Gửi custom notification đến tất cả devices...${NC}"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"secretKey\": \"$SECRET_KEY\",
    \"title\": \"Test Notification 🎬\",
    \"body\": \"Đây là test từ script shell!\",
    \"data\": {
      \"type\": \"announcement\",
      \"timestamp\": \"$(date)\"
    }
  }"
echo -e "\n"

# Test 2: Send new episode notification
echo -e "${YELLOW}📤 Test 2: Gửi notification 'Tập mới'...${NC}"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"secretKey\": \"$SECRET_KEY\",
    \"type\": \"new_episode\",
    \"categoryName\": \"Hoàn Mỹ Thế Giới\",
    \"categorySlug\": \"hoan-my-the-gioi\",
    \"episode\": \"99\"
  }"
echo -e "\n"

# Test 3: Send new category notification
echo -e "${YELLOW}📤 Test 3: Gửi notification 'Phim mới'...${NC}"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"secretKey\": \"$SECRET_KEY\",
    \"type\": \"new_category\",
    \"categoryName\": \"Thần Ấn Vương Tọa\",
    \"categorySlug\": \"than-an-vuong-toa\"
  }"
echo -e "\n"

echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "${YELLOW}💡 Check mobile app to see notifications${NC}"

