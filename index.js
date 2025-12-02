#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { glob } from "glob";
import path from "path";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";
import pc from "picocolors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function showBanner() {
  console.log(pc.cyan(`
 ██████╗ ██████╗ ██╗██╗  ██╗
 ██╔══██╗██╔══██╗██║╚██╗██╔╝
 ██████╔╝██████╔╝██║ ╚███╔╝
 ██╔═══╝ ██╔══██╗██║ ██╔██╗
 ██║     ██║  ██║██║██╔╝ ██╗
 ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
  `));
  console.log(pc.gray("  A powerful CLI toolkit for developers\n"));
}

async function loadCommands() {
  const commandsDir = path.join(__dirname, "commands");
  const commandFiles = await glob("*.js", {
    cwd: commandsDir,
    absolute: true,
  });

  const commands = [];
  for (const file of commandFiles) {
    const commandModule = await import(pathToFileURL(file).href);
    commands.push(commandModule);
  }

  return commands;
}

async function main() {
  showBanner();

  const commands = await loadCommands();

  let cli = yargs(hideBin(process.argv))
    .scriptName("prix")
    .usage("$0 <command> [options]")
    .demandCommand(1, "You need to specify a command")
    .help()
    .alias("h", "help")
    .version("1.0.0")
    .alias("v", "version");

  commands.forEach((cmd) => {
    cli = cli.command({
      command: cmd.command,
      aliases: cmd.aliases || [],
      describe: cmd.describe,
      builder: cmd.builder,
      handler: cmd.handler
    });
  });

  await cli.parse();
}

main();
