#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🎥 Setting up Video Support${NC}\n"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ ffmpeg not found${NC}"
    echo -e "${YELLOW}Installing ffmpeg...${NC}\n"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install ffmpeg
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y ffmpeg
        elif command -v apk &> /dev/null; then
            sudo apk add ffmpeg
        else
            echo -e "${RED}Please install ffmpeg manually${NC}"
            exit 1
        fi
    fi
fi

echo -e "${GREEN}✓ ffmpeg installed${NC}"
ffmpeg -version | head -n 1

# Run Prisma migration
echo -e "\n${YELLOW}Running database migration...${NC}"
npx prisma migrate dev --name add_video_support

echo -e "\n${GREEN}✓ Database migrated${NC}"

# Generate Prisma client
echo -e "\n${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

echo -e "\n${GREEN}✓ Prisma client generated${NC}"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Video support setup complete!${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Restart API server: ${GREEN}npm run start:dev${NC}"
echo -e "2. Restart worker: ${GREEN}npm run start:worker${NC}"
echo -e "3. Test video upload via web app\n"

echo -e "${BLUE}Test video upload:${NC}"
echo -e "  Visit: ${GREEN}http://localhost:5173/e/AB3X9K${NC}"
echo -e "  Upload a short MP4 video (max 15s, 40MB)\n"
