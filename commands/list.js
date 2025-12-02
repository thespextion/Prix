import * as p from "@clack/prompts";
import pc from "picocolors";
import { glob } from "glob";
import path from "path";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const command = "list";
export const describe = "List all available commands";

export const builder = () => {};

export const handler = async () => {
  await listCommands();
};

async function listCommands() {
  p.intro(pc.bgMagenta(pc.black(" Available Commands ")));

  try {
    const commandFiles = await glob("*.js", {
      cwd: __dirname,
    });

    console.log(pc.bold("\nCommands:\n"));

    const commands = [];

    for (const file of commandFiles) {
      const commandPath = path.join(__dirname, file);
      const commandModule = await import(pathToFileURL(commandPath).href);

      if (commandModule.command && commandModule.describe) {
        commands.push({
          name: commandModule.command,
          description: commandModule.describe,
        });
      }
    }

    commands.sort((a, b) => {
      const aName = a.name.split(" ")[0];
      const bName = b.name.split(" ")[0];
      return aName.localeCompare(bName);
    });

    commands.forEach((cmd) => {
      const commandName = cmd.name.split(" ")[0];
      const args = cmd.name.substring(commandName.length);
      console.log(
        `  ${pc.cyan(commandName)}${pc.gray(args)} - ${pc.yellow(cmd.description)}`
      );
    });

    console.log(
      pc.gray("\n\nRun 'prix <command> --help' for more info on a command\n")
    );

    p.outro(pc.green(`Total: ${commands.length} commands available`));
  } catch (error) {
    p.cancel(pc.red(`Error: ${error.message}`));
  }
}
