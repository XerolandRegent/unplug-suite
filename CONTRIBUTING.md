# Contributing to Unplug Suite

Thank you for your interest in contributing to Unplug Suite! This document provides guidelines and instructions for contributing to this project.

## Licensing Notice

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License** (CC BY-NC 4.0). By contributing to this project, you agree that your contributions will be licensed under this license.

Key license requirements:
- Commercial use of this software is prohibited
- Attribution to Unplug Suite must be maintained in all copies and derivatives
- Modifications are allowed but must be indicated
- The Unplug Suite creators do not endorse derivative works

For the full license text, see the [LICENSE](LICENSE) file or visit: http://creativecommons.org/licenses/by-nc/4.0/legalcode

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as much detail as possible.
- **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.
- **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as much detail as possible.
- **Provide specific examples to demonstrate the steps or point out the part of Unplug Suite where the enhancement should be applied**.
- **Describe the current behavior and explain which behavior you expected to see instead** and why.
- **Explain why this enhancement would be useful** to most Unplug Suite users.
- **List some other applications where this enhancement exists**, if applicable.

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the JavaScript and CSS styleguides
- Include thoughtfully-worded, well-structured tests
- Document new code
- End all files with a newline
- **Ensure your contributions comply with the CC BY-NC 4.0 license**

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
    - 🎨 `:art:` when improving the format/structure of the code
    - 🐎 `:racehorse:` when improving performance
    - 🔒 `:lock:` when dealing with security
    - 📝 `:memo:` when writing docs
    - 🐛 `:bug:` when fixing a bug
    - 🔥 `:fire:` when removing code or files
    - 💚 `:green_heart:` when fixing the CI build
    - ✅ `:white_check_mark:` when adding tests
    - ⬆️ `:arrow_up:` when upgrading dependencies
    - ⬇️ `:arrow_down:` when downgrading dependencies
    - 👕 `:shirt:` when removing linter warnings

### JavaScript Styleguide

All JavaScript code is linted with ESLint and should adhere to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

### CSS Styleguide

- Use a consistent naming convention (BEM is recommended)
- Use meaningful names, not presentational ones
- Keep selectors as short as possible
- Avoid using IDs as selectors
- Use properties appropriate to the element (e.g., `text-align` for text, not `margin-left`)

### Documentation Styleguide

- Use [Markdown](https://daringfireball.net/projects/markdown) for documentation.
- Reference methods and classes in markdown with the custom `{.name}` syntax:
    - Classes with `{.Class}`
    - Methods with `{.method()}`
    - Properties with `{.property}`
- Reference sections in the same document with `[Link to section](#section-id)`.

## Project Structure

When contributing to Unplug Suite, please respect the following project structure:

unplug-suite/
unplug/
├── README.md                 # Main project README
├── LICENSE                   # CC BY-NC 4.0 License
├── CONTRIBUTING.md           # This file
├── .gitignore                # Git ignore file
├── assets/                   # Shared assets
├── launcher.sh               # Main launcher script
├── shared/                   # Shared libraries and utilities
│   ├── lib/                  # Common code libraries
│   └── styles/               # Shared CSS styles
└── tools/                    # Individual tools
└── [tool-name]/          # Each tool in its own directory
├── README.md         # Tool-specific documentation
└── ...               # Tool files

## Tool Development Guidelines

When developing new tools for Unplug Suite, please follow these guidelines:

1. **Create a dedicated directory** in the `tools/` folder for your tool.
2. **Include a comprehensive README.md** that explains what the tool does, how to use it, and any potential risks.
3. **Follow the branding guidelines** to maintain consistency across the suite:
   - Use the Unplug badge in the UI
   - Follow the color scheme
   - Use consistent naming patterns
4. **Include safety measures**:
   - Confirmation dialogs for destructive actions
   - Clear warnings about irreversible operations
   - Logging of actions
   - Dry-run option where feasible
5. **Keep privacy in mind**:
   - No telemetry or tracking
   - No data sent to external servers without explicit consent
   - Clear documentation of what happens to user data
6. **Adhere to non-commercial requirements**:
   - Do not add features intended for commercial use
   - Ensure all code respects the CC BY-NC 4.0 license terms

## Adding a New Tool Checklist

- [ ] Create a directory for your tool in the `tools/` folder
- [ ] Add a comprehensive README.md for your tool
- [ ] Implement the tool following the guidelines above
- [ ] Add appropriate tests
- [ ] Update the main README.md to include your tool
- [ ] Update the launcher.sh script to include your tool
- [ ] Submit a pull request with a clear description of your tool
- [ ] Confirm compliance with CC BY-NC 4.0 license

## Non-Commercial Restriction

Please note that this project prohibits commercial use as per the CC BY-NC 4.0 license. Contributions that enable or facilitate commercial use will not be accepted. Examples of prohibited commercial use include:

- Selling the software or derivative works
- Including the software in a commercial product
- Using the software in a commercial service
- Monetizing the software through advertising or subscriptions

## Questions?

If you have any questions about contributing, please open an issue with the label "question".

Thank you for your contribution!