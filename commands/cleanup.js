import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";

export const command = "cleanup";
export const describe = "Clean up common build/cache directories";

export const builder = (yargs) => {
  return yargs.option("dry-run", {
    alias: "d",
    describe: "Show what would be deleted without actually deleting",
    type: "boolean",
    default: false,
  });
};

export const handler = async (argv) => {
  await cleanup(argv.dryRun);
};

async function cleanup(dryRun) {
  p.intro(pc.bgRed(pc.black(" Project Cleanup ")));

  const dirsToClean = [
    "node_modules",
    "dist",
    "build",
    ".next",
    "coverage",
    ".cache",
    "out",
    ".turbo",
  ];

  const found = [];

  for (const dir of dirsToClean) {
    try {
      await fs.access(dir);
      const stats = await fs.stat(dir);
      if (stats.isDirectory()) {
        found.push(dir);
      }
    } catch {}
  }

  if (found.length === 0) {
    p.outro(pc.yellow("No directories to clean!"));
    return;
  }

  console.log("\n" + pc.bold("Directories found:"));
  found.forEach((dir) => console.log(pc.red(`  • ${dir}/`)));

  if (dryRun) {
    p.outro(pc.yellow("Dry run - nothing was deleted"));
    return;
  }

  const confirm = await p.confirm({
    message: "Delete these directories?",
    initialValue: false,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Operation cancelled");
    return;
  }

  const spinner = p.spinner();
  spinner.start("Cleaning up...");

  for (const dir of found) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      console.log(pc.red(`Failed to delete ${dir}: ${error.message}`));
    }
  }

  spinner.stop("Cleanup complete!");
  p.outro(pc.green(`Deleted ${found.length} directories!`));
}
