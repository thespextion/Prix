import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";
import path from "path";

export const command = "todo [dir]";
export const describe = "Find all TODO, FIXME, HACK comments in your code";

export const builder = (yargs) => {
  return yargs
    .positional("dir", {
      describe: "Directory to search",
      default: ".",
    })
    .option("type", {
      alias: "t",
      describe: "Comment types to find",
      default: "TODO,FIXME,HACK,BUG,XXX",
    });
};

export const handler = async (argv) => {
  await findTodos(argv.dir, argv.type.split(","));
};

async function findTodos(dir, types) {
  p.intro(pc.bgMagenta(pc.black(" TODO Finder ")));

  const todos = [];

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (!["node_modules", "dist", "build", ".git"].includes(entry.name)) {
          await walk(fullPath);
        }
      } else if (
        entry.isFile() &&
        /\.(js|ts|jsx|tsx|py|java|cpp|c|go|rs)$/.test(entry.name)
      ) {
        const content = await fs.readFile(fullPath, "utf-8");
        const lines = content.split("\n");

        lines.forEach((line, index) => {
          types.forEach((type) => {
            const regex = new RegExp(`(//|#|/\\*)\\s*${type}:?\\s*(.+)`, "i");
            const match = line.match(regex);
            if (match) {
              todos.push({
                file: fullPath,
                line: index + 1,
                type: type,
                message: match[2].trim(),
              });
            }
          });
        });
      }
    }
  }

  const spinner = p.spinner();
  spinner.start("Searching for TODOs...");

  try {
    await walk(dir);
    spinner.stop(`Found ${todos.length} items`);

    if (todos.length === 0) {
      p.outro(pc.yellow("No TODOs found!"));
      return;
    }

    console.log("\n");
    todos.forEach((todo) => {
      const typeColor =
        {
          TODO: pc.blue,
          FIXME: pc.red,
          HACK: pc.yellow,
          BUG: pc.red,
          XXX: pc.magenta,
        }[todo.type] || pc.white;

      console.log(
        typeColor(`[${todo.type}]`) + pc.gray(` ${todo.file}:${todo.line}`)
      );
      console.log(`  ${todo.message}\n`);
    });

    p.outro(pc.green("Search complete!"));
  } catch (error) {
    spinner.stop("Error during search");
    p.cancel(pc.red(`Error: ${error.message}`));
  }
}
