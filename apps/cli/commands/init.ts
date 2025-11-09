import { writeFileSync } from "fs";
import { join } from "path";
import { getConfig, kinoConfig } from "@/config";
import { highlighter } from "@/utils/highlighter";
import { logger } from "@/utils/logger";
import { Command } from "commander";
import prompts from "prompts";
import z from "zod";

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
    const result = await getConfig(path);
    if (result !== null && !parsedOpts.force) {
      logger.error(
        `Kino is already initialized in ${highlighter.info(result.filepath)}`
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
    let packages: string | undefined;
    if (!packages) {
      const { packagesPath } = await prompts([
        {
          type: "text",
          name: "packagesPath",
          message: `The path to the packages directory, defaults to ${highlighter.info("kino")}`,
          initial: "kino",
        },
      ]);
      packages = packagesPath;
    }
    writeFileSync(
      join(path, "kino.json"),
      JSON.stringify(
        kinoConfig({
          includeTests,
          resolvedPaths: { packages: packages ?? "kino" },
        }),
        null,
        2
      )
    );
  });
