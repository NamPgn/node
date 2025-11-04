#!/bin/bash

# Script deploy Node.js Backend API
# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   🚀 Bắt đầu Deploy Backend API${NC}"
echo -e "${GREEN}========================================${NC}"

# Bước 1: Git pull
echo -e "\n${YELLOW}📥 Bước 1: Pulling code mới từ GitHub...${NC}"
git pull
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull thất bại!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git pull thành công${NC}"

# Bước 2: Install dependencies (nếu có thay đổi package.json)
echo -e "\n${YELLOW}📦 Bước 2: Kiểm tra dependencies...${NC}"
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo -e "${YELLOW}Phát hiện thay đổi package.json, đang cài đặt dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ npm install thất bại!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies đã được cập nhật${NC}"
else
    echo -e "${GREEN}✅ Không có thay đổi dependencies${NC}"
fi

# Bước 3: Build TypeScript
echo -e "\n${YELLOW}🔨 Bước 3: Building TypeScript...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build thất bại!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build thành công${NC}"

# Bước 4: Restart PM2
echo -e "\n${YELLOW}🔄 Bước 4: Restarting PM2 application...${NC}"

# Kiểm tra xem app đã tồn tại chưa
if pm2 list | grep -q "my-app"; then
    echo -e "${YELLOW}Đang xóa app cũ...${NC}"
    pm2 delete my-app
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Không thể xóa app cũ!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Đã xóa app cũ${NC}"
fi

# Start app mới
echo -e "${YELLOW}Đang start app mới...${NC}"
pm2 start npm --name "my-app" --cron-restart "0 * * * *" --max-memory-restart 150M -- run serve
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Không thể start app!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ App đã được start${NC}"

# Bước 5: Save PM2 config
echo -e "\n${YELLOW}💾 Bước 5: Saving PM2 configuration...${NC}"
pm2 save
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Không thể save PM2 config!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PM2 config đã được lưu${NC}"

# Hiển thị status
echo -e "\n${YELLOW}📊 Status hiện tại:${NC}"
pm2 list

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ Deploy thành công! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"

# Hiển thị logs
echo -e "\n${YELLOW}📝 Logs gần đây:${NC}"
pm2 logs my-app --lines 20 --nostream

