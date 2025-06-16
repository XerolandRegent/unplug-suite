# ChatGPT Scrubber

![ChatGPT Scrubber](../../assets/chatgpt-scrubber-banner.png)

> Bulk delete your archived ChatGPT conversations with ease

## Overview

ChatGPT Scrubber is a Firefox extension that helps you manage and clean up your archived ChatGPT conversations. With a simple, intuitive interface, you can delete all your archived conversations at once, rather than removing them one by one.

**⚠️ WARNING: Deletion is permanent and cannot be undone. Please use with caution.**

![Screenshot](../../assets/chatgpt-scrubber-screenshot.png)

## Features

- 🗑️ Bulk delete all archived ChatGPT conversations
- 📊 Real-time progress tracking with visual indicators
- 🔄 Automatically detect and count archives
- ⚙️ Configurable settings (confirmation dialogs, auto-open)
- 📝 Detailed logs of deletion activity
- 🔒 Privacy-focused - works entirely in your browser

## Installation

### From Firefox Add-ons (Recommended)

1. Visit the [Firefox Add-ons page for ChatGPT Scrubber](https://addons.mozilla.org/en-US/firefox/addon/chatgpt-scrubber/)
2. Click "Add to Firefox"
3. Follow the installation prompts

### Manual Installation (Developer Mode)

1. Clone the Unplug repository:
   ```bash
   git clone https://github.com/unplug-suite/unplug.git
   cd unplug/tools/chatgpt-scrubber
   ```

2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on..."
5. Navigate to the folder where you cloned the repository
6. Select the `manifest.json` file in the `chatgpt-scrubber` directory

## Usage

1. Install the extension and navigate to [ChatGPT](https://chat.openai.com/)
2. Click the ChatGPT Scrubber icon in your browser toolbar
3. Click "Open Archives" to view your archived conversations
4. Review the number of archives detected
5. Click "Delete All Archives" to begin the process
6. Confirm the deletion when prompted (if confirmation is enabled)
7. Monitor the progress as the extension deletes your archives
8. When complete, you'll see a confirmation message

## Configuration Options

- **Auto-open archives panel**: Automatically opens the archives panel when you click the extension icon
- **Confirm before bulk delete**: Shows a confirmation dialog before deleting all archives (enabled by default)

## Privacy Policy

ChatGPT Scrubber respects your privacy:
- ✅ Works entirely locally in your browser
- ✅ No data is sent to any servers
- ✅ No tracking or analytics
- ✅ No personal data is collected or stored

## Technical Details

The extension works by interacting with the ChatGPT web interface:

1. It detects when the Archived Chats panel is open
2. It counts the number of archived conversations
3. When instructed to delete, it programmatically clicks the delete buttons
4. It confirms each deletion and tracks progress
5. All operations happen in your browser - no data is sent externally

## Frequently Asked Questions

**Q: Is this an official OpenAI tool?**  
A: No, ChatGPT Scrubber is an independent open-source project and is not affiliated with or endorsed by OpenAI.

**Q: Can I recover deleted archives?**  
A: No, once archives are deleted, they cannot be recovered. Use this tool with caution.

**Q: Does this delete my active conversations too?**  
A: No, this tool only affects conversations in your archive.

**Q: Will this work with future ChatGPT interface updates?**  
A: We strive to keep the extension compatible with interface changes. If you encounter issues, please report them on GitHub.

## Troubleshooting

If you experience issues:

1. Make sure you're logged into ChatGPT
2. Try refreshing the page
3. Check if there are any archived conversations to delete
4. Disable other extensions that might interfere with ChatGPT
5. Check the browser console for any error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue on our [GitHub repository](https://github.com/unplug-suite/unplug).

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.