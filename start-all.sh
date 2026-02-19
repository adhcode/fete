#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎉 Starting Fete Platform${NC}\n"

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Redis is not running. Please start Redis first:${NC}"
    echo -e "   ${GREEN}redis-server${NC}\n"
    exit 1
fi

echo -e "${GREEN}✓ Redis is running${NC}\n"

# Function to open terminal based on OS
open_terminal() {
    local title=$1
    local command=$2
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && echo -e '\\033[1;34m$title\\033[0m' && $command\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        gnome-terminal --title="$title" -- bash -c "cd $(pwd) && echo -e '\033[1;34m$title\033[0m' && $command; exec bash"
    else
        echo "Please run manually: $command"
    fi
}

echo -e "${BLUE}Starting services...${NC}\n"

# Start Backend API
echo -e "${GREEN}→ Starting Backend API${NC}"
open_terminal "Fete Backend API" "cd fete-backend && npm run start:dev"
sleep 2

# Start Worker
echo -e "${GREEN}→ Starting Worker${NC}"
open_terminal "Fete Worker" "cd fete-backend && npm run start:worker"
sleep 2

# Start Web App
echo -e "${GREEN}→ Starting Web App${NC}"
open_terminal "Fete Web App" "cd fete-web && npm run dev"
sleep 2

echo -e "\n${GREEN}✓ All services started!${NC}\n"
echo -e "${BLUE}Access the application:${NC}"
echo -e "  Web App:  ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3000${NC}"
echo -e "\n${YELLOW}Test with event code: AB3X9K${NC}\n"
