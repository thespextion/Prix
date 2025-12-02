import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "fs/promises";

export const command = "license [type]";
export const describe = "Generate a LICENSE file";

export const builder = (yargs) => {
  return yargs.positional("type", {
    describe: "License type (MIT, Apache-2.0, GPL-3.0)",
    type: "string",
  });
};

export const handler = async (argv) => {
  await generateLicense(argv.type);
};

async function generateLicense(type) {
  p.intro(pc.bgYellow(pc.black(" License Generator ")));

  const licenses = {
    MIT: (year, author) => `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  };

  if (!type) {
    const response = await p.select({
      message: "Select a license type:",
      options: [{ value: "MIT", label: "MIT License" }],
    });

    if (p.isCancel(response)) {
      p.cancel("Operation cancelled");
      return;
    }
    type = response;
  }

  const author = await p.text({
    message: "Your name:",
    placeholder: "John Doe",
  });

  if (p.isCancel(author)) {
    p.cancel("Operation cancelled");
    return;
  }

  const year = new Date().getFullYear();
  const licenseText = licenses[type](year, author);

  try {
    await fs.writeFile("LICENSE", licenseText);
    p.outro(pc.green(`Created ${type} LICENSE file!`));
  } catch (error) {
    p.cancel(pc.red(`Error: ${error.message}`));
  }
}
