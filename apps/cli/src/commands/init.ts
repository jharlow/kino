import { writeFileSync } from "fs";
import { join } from "path";
import { getKinoConfig } from "@/kino-config/get-kino-config";
import { highlighter } from "@/utils/highlighter";
import { logger } from "@/utils/logger";
import { Command } from "commander";
import prompts from "prompts";
import z from "zod";
import { kinoConfig as makeKinoConfig } from "@/kino-config/schema";
import { doesDirectoryExist } from "@/utils/does-directory-exist";

const initOptionsSchema = z.object({
  cwd: z.string().optional(),
  force: z.boolean().default(false),
  packages: z.string().optional(),
});

export const init = new Command()
  .name("init")
  .description("Initializes kino in an existing Typescript project")
  .option(
    "-c, --cwd <str>",
    "the working directory, defaults to the current working directory"
  )
  .option("-p, --packages <str>", "the path to the packages directory")
  .option(
    "-f, --force",
    "force initialization even if kino is already initialized",
    false
  )
  .action(async (unparsedOpts) => {
    const parsedOpts = initOptionsSchema.parse(unparsedOpts);
    const path = parsedOpts.cwd ?? process.cwd();
    const kinoConfig = await getKinoConfig(path);
    if (kinoConfig !== null && !parsedOpts.force) {
      logger.error(
        `Kino is already initialized in ${highlighter.info(kinoConfig.filepath)}`
      );
      logger.break();
      logger.info(
        `You can run ${highlighter.success("kino init --force")} to update the configuration using the ${highlighter.success("init")} command.`
      );
      process.exit(0);
    }
    logger.info(`Initializing kino in ${highlighter.info(path)}`);
    const { includeTests } = await prompts([
      {
        type: "confirm",
        name: "includeTests",
        message: `Include ${highlighter.info("tests")} when using ${highlighter.success("kino add")}?`,
        initial: true,
      },
    ]);
    const prefixSrc = await doesDirectoryExist(join(path, "src"));
    const { packagesPath } = await prompts([
      {
        type: "text",
        name: "packagesPath",
        message: `The path to the directory kino should output installed packages, defaults to ${highlighter.info(`${prefixSrc ? "src/" : ""}kino`)}`,
        initial: `${prefixSrc ? "src/" : ""}kino`,
      },
    ]);
    writeFileSync(
      join(path, "kino.json"),
      JSON.stringify(
        makeKinoConfig({
          includeTests,
          resolvedPaths: { packages: packagesPath ?? "kino" },
        }),
        null,
        2
      )
    );
  });
