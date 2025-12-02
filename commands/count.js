import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";
import path from "path";

export const command = "count [dir]";
export const describe = "Count lines of code in your project";

export const builder = (yargs) => {
  return yargs
    .positional("dir", {
      describe: "Directory to analyze",
      default: ".",
    })
    .option("ext", {
      alias: "e",
      describe: "File extensions to include (comma-separated)",
      default: "js,ts,jsx,tsx,py,java,cpp,c,go,rs",
    })
    .option("ignore", {
      alias: "i",
      describe: "Directories to ignore (comma-separated)",
      default: "node_modules,dist,build,.git",
    });
};

export const handler = async (argv) => {
  await countLines(argv.dir, argv.ext.split(","), argv.ignore.split(","));
};

async function countLines(dir, extensions, ignore) {
  p.intro(pc.bgCyan(pc.black(" Line Counter ")));

  const stats = { totalFiles: 0, totalLines: 0, byExtension: {} };

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (!ignore.includes(entry.name)) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1);
        if (extensions.includes(ext)) {
          const content = await fs.readFile(fullPath, "utf-8");
          const lines = content.split("\n").length;

          stats.totalFiles++;
          stats.totalLines += lines;
          stats.byExtension[ext] = (stats.byExtension[ext] || 0) + lines;
        }
      }
    }
  }

  const spinner = p.spinner();
  spinner.start("Analyzing files...");

  try {
    await walk(dir);
    spinner.stop("Analysis complete!");

    console.log("\n" + pc.bold("Results:"));
    console.log(pc.cyan(`Total Files: ${stats.totalFiles}`));
    console.log(pc.cyan(`Total Lines: ${stats.totalLines}`));
    console.log("\n" + pc.bold("By Extension:"));

    Object.entries(stats.byExtension)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ext, lines]) => {
        const percentage = ((lines / stats.totalLines) * 100).toFixed(1);
        console.log(pc.yellow(`  .${ext}: ${lines} lines (${percentage}%)`));
      });

    p.outro(pc.green("Done!"));
  } catch (error) {
    spinner.stop("Error during analysis");
    p.cancel(pc.red(`Error: ${error.message}`));
  }
}
