import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";

export const command = "gitignore [template]";
export const describe = "Generate a .gitignore file from templates";

export const builder = (yargs) => {
  return yargs.positional("template", {
    describe: "Template name (node, python, java, etc.)",
    type: "string",
  });
};

export const handler = async (argv) => {
  await generateGitignore(argv.template);
};

async function generateGitignore(template) {
  p.intro(pc.bgBlue(pc.black(" Gitignore Generator ")));

  const templates = {
    node: `# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.pnpm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store`,
    python: `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv

# Distribution
dist/
build/
*.egg-info/

# Testing
.pytest_cache/
.coverage
htmlcov/

# IDE
.vscode/
.idea/
*.swp`,
    java: `# Java
*.class
*.jar
*.war
*.ear
target/
.gradle/
build/

# IDE
.idea/
.vscode/
*.iml
.classpath
.project
.settings/

# Logs
*.log`,
  };

  if (!template) {
    const response = await p.select({
      message: "Select a template:",
      options: [
        { value: "node", label: "Node.js" },
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
      ],
    });

    if (p.isCancel(response)) {
      p.cancel("Operation cancelled");
      return;
    }
    template = response;
  }

  if (!templates[template]) {
    p.cancel(
      pc.red(`Template "${template}" not found. Available: node, python, java`)
    );
    return;
  }

  try {
    await fs.writeFile(".gitignore", templates[template]);
    p.outro(pc.green(`Created .gitignore with ${template} template!`));
  } catch (error) {
    p.cancel(pc.red(`Error: ${error.message}`));
  }
}
