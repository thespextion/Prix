import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";

export const command = "snippet";
export const describe = "Create a code snippet file";

export const builder = () => {};

export const handler = async () => {
  await createSnippet();
};

async function createSnippet() {
  p.intro(pc.bgCyan(pc.black(" Snippet Creator ")));

  const name = await p.text({
    message: "Snippet name:",
    placeholder: "my-snippet",
  });

  if (p.isCancel(name)) {
    p.cancel("Operation cancelled");
    return;
  }

  const language = await p.select({
    message: "Select language:",
    options: [
      { value: "js", label: "JavaScript" },
      { value: "ts", label: "TypeScript" },
      { value: "py", label: "Python" },
      { value: "java", label: "Java" },
    ],
  });

  if (p.isCancel(language)) {
    p.cancel("Operation cancelled");
    return;
  }

  const snippets = {
    js: `// ${name}
function ${name}() {
  // Your code here
  console.log('Hello from ${name}');
}

export default ${name};`,
    ts: `// ${name}
export function ${name}(): void {
  // Your code here
  console.log('Hello from ${name}');
}`,
    py: `# ${name}
def ${name}():
    """Your function description"""
    print(f'Hello from ${name}')

if __name__ == '__main__':
    ${name}()`,
    java: `public class ${name.charAt(0).toUpperCase() + name.slice(1)} {
    public static void main(String[] args) {
        System.out.println("Hello from ${name}");
    }
}`,
  };

  const extensions = { js: "js", ts: "ts", py: "py", java: "java" };
  const filename = `${name}.${extensions[language]}`;

  try {
    await fs.writeFile(filename, snippets[language]);
    p.outro(pc.green(`Created ${filename}!`));
  } catch (error) {
    p.cancel(pc.red(`Error: ${error.message}`));
  }
}
