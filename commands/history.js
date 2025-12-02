import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const command = "history";
export const describe = "Show command history from your shell";

export const builder = (yargs) => {
  return yargs
    .option("limit", {
      alias: "l",
      describe: "Number of commands to show",
      type: "number",
      default: 50,
    })
    .option("search", {
      alias: "s",
      describe: "Search for commands containing this text",
      type: "string",
    })
    .option("interactive", {
      alias: "i",
      describe: "Interactively select and execute a command",
      type: "boolean",
      default: false,
    });
};

export const handler = async (argv) => {
  await showHistory(argv.limit, argv.search, argv.interactive);
};

async function getHistory() {
  let history = [];
  const platform = os.platform();

  if (platform === "win32") {
    const psHistoryPath = path.join(
      os.homedir(),
      "AppData",
      "Roaming",
      "Microsoft",
      "Windows",
      "PowerShell",
      "PSReadLine",
      "ConsoleHost_history.txt"
    );

    try {
      const content = await fs.readFile(psHistoryPath, "utf-8");
      history = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } catch (error) {
      try {
        const { stdout } = await execAsync("doskey /history");
        history = stdout
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      } catch {
        throw new Error(
          "Could not find PowerShell or CMD history. Make sure PSReadLine is enabled."
        );
      }
    }
  } else {
    const homeDir = os.homedir();
    const historyFiles = [
      path.join(homeDir, ".bash_history"),
      path.join(homeDir, ".zsh_history"),
    ];

    for (const file of historyFiles) {
      try {
        const content = await fs.readFile(file, "utf-8");
        history = content
          .split("\n")
          .map((line) => {
            return line.replace(/^:\s*\d+:\d+;/, "").trim();
          })
          .filter((line) => line.length > 0);
        break;
      } catch {
        continue;
      }
    }

    if (history.length === 0) {
      throw new Error("Could not find shell history file");
    }
  }

  return history;
}

async function showHistory(limit, searchTerm, interactive) {
  p.intro(pc.bgCyan(pc.black(" Command History ")));

  try {
    let history = await getHistory();

    if (history.length === 0) {
      p.outro(pc.yellow("No command history found!"));
      return;
    }

    if (searchTerm) {
      history = history.filter((cmd) =>
        cmd.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (history.length === 0) {
        p.outro(pc.yellow(`No commands found matching "${searchTerm}"`));
        return;
      }
    }

    const recentCommands = history.slice(-limit).reverse();

    if (interactive) {
      const options = recentCommands.map((cmd, index) => ({
        value: cmd,
        label: `${pc.gray(`${history.length - index}.`)} ${cmd}`,
      }));

      const selected = await p.select({
        message: "Select a command to execute:",
        options: options,
      });

      if (p.isCancel(selected)) {
        p.cancel("Operation cancelled");
        return;
      }

      const confirm = await p.confirm({
        message: `Execute: ${pc.cyan(selected)}?`,
        initialValue: true,
      });

      if (p.isCancel(confirm) || !confirm) {
        p.cancel("Operation cancelled");
        return;
      }

      const spinner = p.spinner();
      spinner.start(`Executing: ${selected}`);

      try {
        const { stdout, stderr } = await execAsync(selected, {
          shell: platform === "win32" ? "powershell.exe" : undefined,
        });

        spinner.stop("Execution complete!");

        if (stdout) {
          console.log("\n" + pc.bold("Output:"));
          console.log(stdout);
        }

        if (stderr) {
          console.log("\n" + pc.bold("Errors:"));
          console.log(pc.red(stderr));
        }

        p.outro(pc.green("Done!"));
      } catch (error) {
        spinner.stop("Execution failed");
        console.log("\n" + pc.red("Error:"));
        console.log(error.stdout || "");
        console.log(pc.red(error.stderr || error.message));
        p.cancel("Command failed");
      }
    } else {
      console.log(
        pc.bold(
          `\nShowing last ${recentCommands.length} commands${searchTerm ? ` matching "${searchTerm}"` : ""}:\n`
        )
      );

      recentCommands.forEach((command, index) => {
        const number = pc.gray(`${history.length - index}.`);
        const commandStr = pc.cyan(command);
        console.log(`${number} ${commandStr}`);
      });

      console.log(
        pc.gray("\nTip: Use --interactive or -i to select and execute a command")
      );

      p.outro(pc.green(`Total commands: ${history.length}`));
    }
  } catch (error) {
    p.cancel(pc.red(`Error reading history: ${error.message}`));
  }
}
