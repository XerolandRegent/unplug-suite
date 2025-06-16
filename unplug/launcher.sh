#!/bin/bash
# File Name: launcher.sh
# File Path: /launcher.sh
# Description: Main launcher script for Unplug Suite
# Date Created: June 16, 2025
# Date Last Updated: June 16, 2025
# Version History: 1.0 - Initial version

# Colors and formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
MAGENTA="\033[35m"
CYAN="\033[36m"
RESET="\033[0m"

# Logo and welcome message
show_welcome() {
    clear
    echo -e "${BLUE}${BOLD}"
    echo "  _    _       _____  _    _   _____ "
    echo " | |  | |     |  __ \\| |  | | / ____|"
    echo " | |  | |_ __ | |__) | |  | || |  __ "
    echo " | |  | | '_ \\|  ___/| |  | || | |_ |"
    echo " | |__| | | | | |    | |__| || |__| |"
    echo "  \\____/|_| |_|_|     \\____/  \\_____|"
    echo -e "${RESET}"
    echo -e "${BOLD}Take control of your digital footprint${RESET}"
    echo -e "${CYAN}Version 1.0${RESET}"
    echo ""
    echo -e "${YELLOW}WARNING: Some actions performed by these tools are IRREVERSIBLE.${RESET}"
    echo -e "Always backup important data before proceeding."
    echo ""
}

# Check required dependencies
check_dependencies() {
    local missing_deps=0
    
    echo -e "${BOLD}Checking dependencies...${RESET}"
    
    # Check for Firefox (for browser extensions)
    if ! command -v firefox &> /dev/null; then
        echo -e "  ${RED}✗ Firefox${RESET} - Required for browser extensions"
        missing_deps=$((missing_deps + 1))
    else
        echo -e "  ${GREEN}✓ Firefox${RESET} - Found"
    fi
    
    # Check for curl (for downloading)
    if ! command -v curl &> /dev/null; then
        echo -e "  ${RED}✗ curl${RESET} - Required for downloading updates"
        missing_deps=$((missing_deps + 1))
    else
        echo -e "  ${GREEN}✓ curl${RESET} - Found"
    fi
    
    # Check for unzip (for extracting extensions)
    if ! command -v unzip &> /dev/null; then
        echo -e "  ${RED}✗ unzip${RESET} - Required for extracting extensions"
        missing_deps=$((missing_deps + 1))
    else
        echo -e "  ${GREEN}✓ unzip${RESET} - Found"
    fi
    
    echo ""
    
    if [ $missing_deps -gt 0 ]; then
        echo -e "${RED}${BOLD}Missing $missing_deps dependencies.${RESET}"
        echo "Please install the required dependencies and try again."
        echo ""
        return 1
    fi
    
    return 0
}

# Show available tools
show_tools() {
    echo -e "${BOLD}Available Tools:${RESET}"
    echo ""
    
    # ChatGPT Scrubber
    echo -e "${CYAN}1. ChatGPT Scrubber${RESET}"
    echo "   Bulk delete archived conversations from ChatGPT"
    echo "   Status: Available"
    echo ""
    
    # Facebook Scrubber (Planned)
    echo -e "${CYAN}2. Facebook Scrubber${RESET}"
    echo "   Remove posts, comments, and other content from Facebook"
    echo "   Status: Planned"
    echo ""
    
    # Metadata Stripper (Planned)
    echo -e "${CYAN}3. Metadata Stripper${RESET}"
    echo "   Remove identifying metadata from files before sharing"
    echo "   Status: Planned"
    echo ""
    
    # Consent Revoker (Planned)
    echo -e "${CYAN}4. Consent Revoker${RESET}"
    echo "   Generate GDPR/CCPA compliant data deletion requests"
    echo "   Status: Planned"
    echo ""
    
    echo -e "${CYAN}0. Exit${RESET}"
    echo ""
}

# Install ChatGPT Scrubber
install_chatgpt_scrubber() {
    echo -e "${BOLD}Installing ChatGPT Scrubber...${RESET}"
    
    # Check if Firefox is running
    if pgrep -x "firefox" > /dev/null; then
        echo -e "${YELLOW}Firefox is currently running.${RESET}"
        echo "For the best installation experience, Firefox should be closed."
        echo ""
        read -p "Do you want to continue anyway? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Installation cancelled.${RESET}"
            return 1
        fi
    fi
    
    echo ""
    echo "This will open Firefox and prompt you to install the extension."
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    # Open the extension page in Firefox
    # In a real implementation, this would point to the Firefox Add-ons page
    # or a local XPI file
    firefox "about:debugging#/runtime/this-firefox" &
    
    echo ""
    echo -e "${GREEN}Firefox has been opened.${RESET}"
    echo ""
    echo "To complete installation:"
    echo "1. Click 'Load Temporary Add-on...'"
    echo "2. Navigate to: $(pwd)/tools/chatgpt-scrubber"
    echo "3. Select the manifest.json file"
    echo ""
    echo "For permanent installation, please visit:"
    echo "https://addons.mozilla.org/en-US/firefox/addon/chatgpt-scrubber/"
    echo "(Link will be active once the extension is published)"
    echo ""
    
    read -p "Press Enter once you've completed the installation..."
    
    echo -e "${GREEN}${BOLD}Installation instructions complete!${RESET}"
    echo ""
    echo "To use the extension:"
    echo "1. Visit https://chat.openai.com/"
    echo "2. Click on the ChatGPT Scrubber icon in your browser toolbar"
    echo "3. Follow the on-screen instructions"
    echo ""
    
    return 0
}

# Show development status
show_dev_status() {
    echo -e "${BOLD}Development Status:${RESET}"
    echo ""
    echo "ChatGPT Scrubber: 100% complete"
    echo "Facebook Scrubber: 0% complete"
    echo "Metadata Stripper: 0% complete"
    echo "Consent Revoker: 0% complete"
    echo ""
    echo -e "${BOLD}Upcoming Features:${RESET}"
    echo "- Unified dashboard for all tools"
    echo "- Command-line interfaces for automation"
    echo "- Additional platform integrations"
    echo ""
    read -p "Press Enter to return to the main menu..."
}

# Main menu function
main_menu() {
    local choice
    
    while true; do
        show_welcome
        show_tools
        
        read -p "Enter your choice (0-4): " choice
        echo ""
        
        case $choice in
            0)
                echo "Thank you for using Unplug Suite!"
                exit 0
                ;;
            1)
                install_chatgpt_scrubber
                ;;
            2|3|4)
                echo -e "${YELLOW}This tool is currently under development.${RESET}"
                echo "Please check back in a future release."
                echo ""
                read -p "Press Enter to return to the main menu..."
                ;;
            5)
                # Hidden development status option
                show_dev_status
                ;;
            *)
                echo -e "${RED}Invalid choice. Please try again.${RESET}"
                sleep 2
                ;;
        esac
    done
}

# Start the program
show_welcome
if check_dependencies; then
    main_menu
fi