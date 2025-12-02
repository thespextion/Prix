import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const command = "alias";
export const aliases = ["a"];
export const describe = "Save and manage command aliases";

export const builder = (yargs) => {
  return yargs
    .option("save", {
      alias: "s",
      describe: "Save a new alias",
      type: "boolean",
      default: false,
    })
    .option("clear", {
      alias: "c",
      describe: "Clear all aliases or a specific one",
      type: "string",
    });
};

export const handler = async (argv) => {
  if (argv.save) {
    await saveAliasInteractive();
  } else if (argv.clear !== undefined) {
    if (argv.clear === true || argv.clear === "") {
      await clearAllAliases();
    } else {
      await deleteAlias(argv.clear);
    }
  } else {
    await selectAndRunAlias();
  }
};

function getAliasFilePath() {
  return path.join(__dirname, "..", ".prix_aliases.json");
}

async function loadAliases() {
  try {
    const data = await fs.readFile(getAliasFilePath(), "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveAliases(aliases) {
  await fs.writeFile(getAliasFilePath(), JSON.stringify(aliases, null, 2));
}

async function saveAliasInteractive() {
  p.intro(pc.bgGreen(pc.black(" Save Alias ")));

  const name = await p.text({
    message: "Alias name:",
    placeholder: "dev",
    validate: (value) => {
      if (!value) return "Please enter a name";
      if (!/^[a-zA-Z0-9_-]+$/.test(value))
        return "Only letters, numbers, _ and - allowed";
    },
  });

  if (p.isCancel(name)) {
    p.cancel("Operation cancelled");
    return;
  }

  const command = await p.text({
    message: "Command:",
    placeholder: "npm run dev",
    validate: (value) => (!value ? "Please enter a command" : undefined),
  });

  if (p.isCancel(command)) {
    p.cancel("Operation cancelled");
    return;
  }

  const aliases = await loadAliases();

  if (aliases[name]) {
    const overwrite = await p.confirm({
      message: `Alias "${name}" already exists. Overwrite?`,
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Operation cancelled");
      return;
    }
  }

  aliases[name] = command;
  await saveAliases(aliases);

  p.outro(pc.green(`Saved alias: ${pc.cyan(name)} → ${pc.yellow(command)}`));
}

async function listAliases() {
  p.intro(pc.bgBlue(pc.black(" Saved Aliases ")));

  const aliases = await loadAliases();
  const entries = Object.entries(aliases);

  if (entries.length === 0) {
    p.outro(pc.yellow("No aliases saved yet!"));
    return;
  }

  console.log(pc.bold("\nYour aliases:\n"));

  entries.forEach(([name, command]) => {
    console.log(`  ${pc.cyan(name)} → ${pc.yellow(command)}`);
  });

  console.log(pc.gray("\nUsage: prix alias -r <name>"));
  p.outro(pc.green(`Total aliases: ${entries.length}`));
}

async function deleteAlias(name) {
  p.intro(pc.bgRed(pc.black(" Delete Alias ")));

  const aliases = await loadAliases();

  if (!aliases[name]) {
    p.cancel(pc.red(`Alias "${name}" not found`));
    return;
  }

  const confirm = await p.confirm({
    message: `Delete alias "${name}"?`,
    initialValue: false,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Operation cancelled");
    return;
  }

  delete aliases[name];
  await saveAliases(aliases);

  p.outro(pc.green(`Deleted alias: ${name}`));
}

async function clearAllAliases() {
  p.intro(pc.bgRed(pc.black(" Clear All Aliases ")));

  const aliases = await loadAliases();
  const count = Object.keys(aliases).length;

  if (count === 0) {
    p.outro(pc.yellow("No aliases to clear!"));
    return;
  }

  const confirm = await p.confirm({
    message: `Delete all ${count} aliases?`,
    initialValue: false,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Operation cancelled");
    return;
  }

  await saveAliases({});

  p.outro(pc.green(`Cleared ${count} aliases!`));
}

async function runAlias(name) {
  p.intro(pc.bgMagenta(pc.black(" Run Alias ")));

  const aliases = await loadAliases();

  if (!aliases[name]) {
    p.cancel(pc.red(`Alias "${name}" not found`));
    return;
  }

  const command = aliases[name];
  console.log(pc.gray(`\nExecuting: ${command}\n`));

  const spinner = p.spinner();
  spinner.start("Running command...");

  try {
    const platform = os.platform();
    const { stdout, stderr } = await execAsync(command, {
      shell: platform === "win32" ? "powershell.exe" : undefined,
    });

    spinner.stop("Execution complete!");

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.log(pc.red(stderr));
    }

    p.outro(pc.green("Done!"));
  } catch (error) {
    spinner.stop("Execution failed");
    console.log(pc.red("\nError:"));
    console.log(error.stdout || "");
    console.log(pc.red(error.stderr || error.message));
    p.cancel("Command failed");
  }
}

async function selectAndRunAlias() {
  const aliases = await loadAliases();
  const entries = Object.entries(aliases);

  if (entries.length === 0) {
    console.log(pc.yellow('\nNo aliases saved yet! Use "prix a -s" to create one.\n'));
    return;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.log(pc.bold("\nSaved Aliases:\n"));
    entries.forEach(([name, cmd]) => {
      console.log(`  ${pc.cyan(name)} ${pc.gray("→")} ${cmd}`);
    });
    console.log(pc.gray('\nRun this command in an interactive terminal to select and execute.\n'));
    return;
  }

  p.intro(pc.bgCyan(pc.black(" Select Alias ")));

  const options = entries.map(([name, cmd]) => ({
    value: name,
    label: `${pc.cyan(name)} ${pc.gray("→")} ${cmd}`,
  }));

  const selected = await p.select({
    message: "Select an alias to run:",
    options: options,
  });

  if (p.isCancel(selected)) {
    p.cancel("Operation cancelled");
    return;
  }

  const command = aliases[selected];
  console.log(pc.gray(`\nExecuting: ${command}\n`));

  const spinner = p.spinner();
  spinner.start("Running command...");

  try {
    const platform = os.platform();
    const { stdout, stderr } = await execAsync(command, {
      shell: platform === "win32" ? "powershell.exe" : undefined,
    });

    spinner.stop("Execution complete!");

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.log(pc.red(stderr));
    }

    p.outro(pc.green("Done!"));
  } catch (error) {
    spinner.stop("Execution failed");
    console.log(pc.red("\nError:"));
    console.log(error.stdout || "");
    console.log(pc.red(error.stderr || error.message));
    p.cancel("Command failed");
  }
}

