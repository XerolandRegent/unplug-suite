# Unplug Suite

![Unplug Logo](assets/logo.png)

> Take control of your digital footprint, one platform at a time.

## What is Unplug?

Unplug is a collection of open-source tools designed to help you manage your digital presence, minimize your data footprint, and regain control over your information across various platforms and services.

Whether you want to clean up your conversation history, remove metadata from files, or revoke consent from services collecting your data, Unplug provides the tools you need to make informed decisions about your digital footprint.

## Available Tools

| Tool | Description | Status |
|------|-------------|--------|
| [ChatGPT Scrubber](tools/chatgpt-scrubber/) | Bulk delete archived conversations from ChatGPT | ✅ Available |
| Facebook Scrubber | Remove posts, comments, and other content from your Facebook account | 🔄 Planned |
| Metadata Stripper | Remove identifying metadata from files before sharing | 🔄 Planned |
| Consent Revoker | Generate GDPR/CCPA compliant data deletion requests | 🔄 Planned |

## Getting Started

### Requirements

- Firefox (for browser extensions)
- Bash (for launcher script)
- Internet connection (for online services)

### Installation

#### Option 1: Use the Launcher (Recommended)

1. Clone this repository:
   ```bash
   git clone https://github.com/unplug-suite/unplug.git
   cd unplug
   ```

2. Run the launcher:
   ```bash
   ./launcher.sh
   ```

3. Follow the on-screen instructions to install and configure the tools you want to use.

#### Option 2: Install Individual Tools

Each tool can be installed separately. See the README in each tool's directory for specific installation instructions.

## Core Principles

Unplug is built on these fundamental principles:

1. **User Control**: You should have full control over your data and digital presence
2. **Transparency**: Clear information about what each tool does and how it works
3. **Safety**: Confirmation steps and backups to prevent accidental data loss
4. **Privacy**: No telemetry, tracking, or data collection within our tools
5. **Open Source**: All code is open and available for inspection and contribution

## Important Warnings

⚠️ **Many actions performed by Unplug tools are IRREVERSIBLE**. Please read all warnings and consider backing up your data before using these tools.

Each tool includes:
- Confirmation dialogs for destructive actions
- Detailed logging of actions taken
- Dry-run options where possible
- Clear documentation of what happens to your data

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to help improve Unplug.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all the contributors who have helped make Unplug possible
- Inspiration from digital minimalism and right-to-be-forgotten movements