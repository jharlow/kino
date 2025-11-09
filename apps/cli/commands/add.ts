import { getConfig } from "@/config";
import { highlighter } from "@/utils/highlighter";
import { logger } from "@/utils/logger";
import { spinner } from "@/utils/spinner";
import { Command } from "commander";
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { z } from "zod";

const addOptionsSchema = z.object({
  packages: z.array(z.string()),
  cwd: z.string().optional(),
});

const packageJsonSchema = z.object({ version: z.string() }).loose();

const metadataJsonSchema = z.object({ version: z.string() });

export const add = new Command()
  .name("add")
  .description("Add a new utility function")
  .argument("[packages...]", "names of packages to add to your project")
  .option(
    "-c, --cwd <str>",
    "the working directory, defaults to the current working directory"
  )
  .action(async (packages, unparsedOptions) => {
    const options = addOptionsSchema.parse({ packages, ...unparsedOptions });
    const path = options.cwd ?? process.cwd();
    logger.info(
      `Adding utility functions: ${highlighter.success(options.packages.join(" "))}`
    );
    const result = await getConfig(path);
    if (result === null) {
      logger.error(`Kino is not initialized in ${highlighter.info(path)}`);
      logger.break();
      logger.info(
        `You can run ${highlighter.success("kino init")} to initialize kino in this directory.`
      );
      process.exit(0);
    }
    const addingSpinner = spinner("Adding utility packages...");
    for (const pkg of options.packages) {
      const packagePath = join(`../../`, "packages", pkg, "package.json");
      const rawPackageJson = readFileSync(packagePath, "utf-8");
      const packageJson = packageJsonSchema.parse(JSON.parse(rawPackageJson));
      const srcDirectory = join("../../packages/", pkg);
      const allFiles = readdirSync(srcDirectory);
      const tsFiles = allFiles.filter((file) => file.endsWith(".ts"));
      const newDirectory = join(
        result.filepath.slice(0, result.filepath.length - "kino.json".length),
        result.config.resolvedPaths.packages,
        pkg
      );
      mkdirSync(newDirectory, { recursive: true });
      for (const file of tsFiles) {
        const filePath = join(srcDirectory, file);
        const destPath = join(newDirectory, file);
        copyFileSync(filePath, destPath);
      }
      writeFileSync(
        join(newDirectory, "metadata.json"),
        JSON.stringify(metadataJsonSchema.parse(packageJson), null, 2)
      );
    }
    addingSpinner.succeed(
      `Added ${highlighter.success(options.packages.join(" "))}`
    );
  });
