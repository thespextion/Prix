import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";

export const command = "readme";
export const describe = "Generate a README.md template";

export const builder = () => {};

export const handler = async () => {
  await generateReadme();
};

async function generateReadme() {
  p.intro(pc.bgGreen(pc.black(" README Generator ")));

  const projectName = await p.text({
    message: "Project name:",
    placeholder: "my-awesome-project",
    validate: (value) => (!value ? "Please enter a project name" : undefined),
  });

  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled");
    return;
  }

  const description = await p.text({
    message: "Short description:",
    placeholder: "A brief description of your project",
  });

  if (p.isCancel(description)) {
    p.cancel("Operation cancelled");
    return;
  }

  const readme = `# ${projectName}

${description}

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install ${projectName}
\`\`\`

## Usage

\`\`\`javascript
// Add usage example here
\`\`\`

## API

### Function Name

Description of what the function does.

**Parameters:**
- \`param1\` (type): Description
- \`param2\` (type): Description

**Returns:** Description of return value

## Development

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/${projectName}

# Install dependencies
npm install

# Run tests
npm test
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Your Name
`;

  try {
    await fs.writeFile("README.md", readme);
    p.outro(pc.green("Created README.md successfully!"));
  } catch (error) {
    p.cancel(pc.red(`Error: ${error.message}`));
  }
}
