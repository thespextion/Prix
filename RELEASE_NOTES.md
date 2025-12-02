# Prix CLI v1.0.0 - Initial Release

## Overview

Prix is a powerful CLI toolkit designed to streamline developer workflows. This initial release brings a comprehensive set of productivity tools to help you manage aliases, analyze projects, and automate common development tasks.

## Features

### Command Management
- **Alias System**: Save and manage frequently used commands with an interactive interface
  - Quick access with `prix a`
  - Save aliases with `prix a -s`
  - Clear specific or all aliases
  - Interactive selection and execution

### Project Analysis
- **Code Counter**: Count lines of code across your project with file type filtering
- **Project Analyzer**: Analyze project structure, dependencies, and important files
- **TODO Finder**: Scan codebase for TODO, FIXME, HACK, BUG, and XXX comments

### File Generators
- **Gitignore Generator**: Create .gitignore files from templates (Node, Python, Java, etc.)
- **License Generator**: Generate LICENSE files (MIT, Apache-2.0, GPL-3.0)
- **README Generator**: Create README.md templates
- **Snippet Creator**: Build code snippet files with syntax highlighting

### Utilities
- **Command History**: View, search, and execute commands from your shell history
- **Project Cleanup**: Clean up build and cache directories
- **Command List**: View all available Prix commands

## Installation

```bash
npm install -g @spextion/prix
```

## Package Information

- **Package Name**: `@spextion/prix`
- **Version**: 1.0.0
- **Command**: `prix`
- **Node.js**: >= 14.0.0

## Design Highlights

- Beautiful ASCII art banner
- Colorful, interactive CLI using @clack/prompts
- Intuitive command structure with aliases
- Cross-platform support (Windows, macOS, Linux)

## Usage Examples

### Save and run aliases
```bash
prix a -s              # Save a new alias
prix a                 # Select and run an alias
```

### Analyze your project
```bash
prix analyze           # Full project analysis
prix count             # Count lines of code
prix todo              # Find TODO comments
```

### Generate files
```bash
prix gitignore node    # Generate Node.js .gitignore
prix license MIT       # Generate MIT license
prix readme            # Generate README template
```

## Technical Details

### Dependencies
- `@clack/prompts` ^0.11.0
- `glob` ^13.0.0
- `inquirer` ^8.2.5
- `picocolors` ^1.1.1
- `yargs` ^18.0.0

### Architecture
- Modern ES modules (ESM)
- Dynamic command loading system
- Modular command structure
- Cross-platform shell execution

## Documentation

- [GitHub Repository](https://github.com/thespextion/Prix)
- [npm Package](https://www.npmjs.com/package/@spextion/prix)
- Full documentation available in README.md

## Known Issues

None reported for this release.

## Acknowledgments

Built with modern CLI tools and libraries from the Node.js ecosystem.

## License

ISC License

## Author

**nthnpy3**

---

**Full Changelog**: Initial release

For issues and feature requests, please visit: https://github.com/thespextion/Prix/issues
