```
 ██████╗ ██████╗ ██╗██╗  ██╗
 ██╔══██╗██╔══██╗██║╚██╗██╔╝
 ██████╔╝██████╔╝██║ ╚███╔╝
 ██╔═══╝ ██╔══██╗██║ ██╔██╗
 ██║     ██║  ██║██║██╔╝ ██╗
 ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
```

<div align="center">

### A powerful CLI toolkit for developers

**Streamline your workflow** | **Boost productivity** | **Automate common tasks**

[![npm version](https://img.shields.io/npm/v/@spextion/prix.svg)](https://www.npmjs.com/package/@spextion/prix)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![Bun Version](https://img.shields.io/badge/bun-%3E%3D1.0.0-f472b6)](https://bun.sh)

</div>

---

A powerful and intuitive command-line interface tool designed to streamline your development workflow with a collection of useful utilities.

## Features

- **Command Aliases**: Save and manage frequently used commands
- **Project Analysis**: Analyze project structure and dependencies
- **Code Metrics**: Count lines of code across your project
- **TODO Finder**: Find all TODO, FIXME, HACK comments in your codebase
- **File Generators**: Generate .gitignore files, licenses, README templates
- **History Management**: Search and execute commands from your shell history
- **Code Snippets**: Create and manage code snippets
- **Project Cleanup**: Clean up build and cache directories

## Installation

Install globally to use anywhere:

```bash
# npm
npm install -g @spextion/prix

# bun
bun install -g @spextion/prix
```

Or install locally in your project:

```bash
# npm
npm install @spextion/prix

# bun
bun add @spextion/prix
```

After installation, you can use the `prix` command from your terminal.

## Commands

### Alias Management
Manage command aliases for quick access to frequently used commands.

```bash
prix alias              # List and select from saved aliases (shorthand: prix a)
prix alias -s           # Save a new alias
prix alias -c <name>    # Delete a specific alias
prix alias -c           # Clear all aliases
```

### Project Analysis

```bash
prix analyze            # Analyze project structure and dependencies
prix count       # Count lines of code in your project
prix count --ext js,ts  # Count only specific file types
```

### TODO Finder

```bash
prix todo         # Find all TODO, FIXME, HACK comments
prix todo --type TODO,FIXME  # Search for specific comment types
```

### File Generators

```bash
prix gitignore    # Generate .gitignore from templates
prix license        # Generate LICENSE file (MIT, Apache-2.0, GPL-3.0)
prix readme                 # Generate README template
prix snippet                # Create a code snippet file
```

### History & Utilities

```bash
prix history                    # Show command history
prix history -l 100            # Show last 100 commands
prix history -s "npm"          # Search for commands containing "npm"
prix history -i                # Interactive mode to select and execute

prix list                      # List all available commands
prix cleanup                   # Clean up build/cache directories
prix cleanup --dry-run         # Preview what would be deleted
```

## Usage Examples

### Managing Aliases

Save commonly used commands:
```bash
prix a -s
# Enter alias name: dev
# Enter command: npm run dev
```

Run a saved alias:
```bash
prix a
# Select from your saved aliases interactively
```

### Finding TODOs

```bash
prix todo
# Scans your project for TODO, FIXME, HACK, BUG, and XXX comments
```

### Counting Code

```bash
prix count
# Shows lines of code breakdown by file type
```

### Generating Files

```bash
prix gitignore node
# Generates a Node.js .gitignore file

prix license MIT
# Generates an MIT license file
```

## Configuration

Prix stores configuration files in your project root:
- `.prix_aliases.json` - Saved command aliases
- `.prix_history.json` - Command history (if applicable)

## Requirements

- Node.js 14.x or higher **or** Bun 1.0 or higher
- npm, yarn, or bun

## Development

Clone the repository:
```bash
git clone <repository-url>
cd cli
npm install   # or: bun install
```

Run locally:
```bash
node index.js <command>   # or: bun index.js <command>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

nthnpy3

## Support

For issues and feature requests, please create an issue on GitHub.
