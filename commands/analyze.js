import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";
import path from "path";

export const command = "analyze";
export const describe = "Analyze project structure and dependencies";

export const builder = () => {};

export const handler = async () => {
  await analyzeProject();
};

async function analyzeProject() {
  p.intro(pc.bgBlue(pc.black(" Project Analyzer ")));

  const spinner = p.spinner();
  spinner.start("Analyzing project...");

  try {
    const analysis = {
      files: 0,
      directories: 0,
      hasPackageJson: false,
      hasGit: false,
      hasReadme: false,
      hasLicense: false,
      dependencies: 0,
    };

    try {
      await fs.access("package.json");
      analysis.hasPackageJson = true;
      const pkg = JSON.parse(await fs.readFile("package.json", "utf-8"));
      analysis.dependencies =
        Object.keys(pkg.dependencies || {}).length +
        Object.keys(pkg.devDependencies || {}).length;
    } catch {}

    try {
      await fs.access(".git");
      analysis.hasGit = true;
    } catch {}

    try {
      await fs.access("README.md");
      analysis.hasReadme = true;
    } catch {}

    try {
      await fs.access("LICENSE");
      analysis.hasLicense = true;
    } catch {}

    async function count(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          analysis.directories++;
          await count(fullPath);
        } else {
          analysis.files++;
        }
      }
    }

    await count(".");

    spinner.stop("Analysis complete!");

    console.log("\n" + pc.bold("Project Structure:"));
    console.log(pc.cyan(`Files: ${analysis.files}`));
    console.log(pc.cyan(`Directories: ${analysis.directories}`));

    console.log("\n" + pc.bold("Configuration:"));
    console.log(
      analysis.hasPackageJson
        ? pc.green("✓ package.json")
        : pc.red("✗ package.json")
    );
    console.log(
      analysis.hasGit
        ? pc.green("✓ Git initialized")
        : pc.red("✗ Git not initialized")
    );
    console.log(
      analysis.hasReadme
        ? pc.green("✓ README.md")
        : pc.yellow("✗ README.md missing")
    );
    console.log(
      analysis.hasLicense
        ? pc.green("✓ LICENSE")
        : pc.yellow("✗ LICENSE missing")
    );

    if (analysis.hasPackageJson) {
      console.log(pc.cyan(`\nDependencies: ${analysis.dependencies}`));
    }

    const suggestions = [];
    if (!analysis.hasReadme)
      suggestions.push('Run "prix readme" to generate a README');
    if (!analysis.hasLicense)
      suggestions.push('Run "prix license" to add a license');
    if (!analysis.hasGit)
      suggestions.push('Run "git init" to initialize version control');

    if (suggestions.length > 0) {
      console.log("\n" + pc.bold("Suggestions:"));
      suggestions.forEach((s) => console.log(pc.yellow(`  • ${s}`)));
    }

    p.outro(pc.green("Analysis complete!"));
  } catch (error) {
    spinner.stop("Error during analysis");
    p.cancel(pc.red(`Error: ${error.message}`));
  }
}
