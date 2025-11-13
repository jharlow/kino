import { writeFileSync } from "fs";
import { join } from "path";
import { highlighter } from "@/utils/highlighter";
import { logger } from "@/utils/logger";
import { Command } from "commander";
import prompts from "prompts";
import z from "zod";
import { doesDirectoryExist } from "@/utils/does-directory-exist";
import { KinoContextManager } from "@/kino-context/manager";
import {
  PackageManager,
  PackageManagerHandler,
  packageManagers,
} from "@/package-json/package-managers";

const initOptionsSchema = z.object({
  cwd: z.string().optional(),
  force: z.boolean().default(false),
  packages: z.string().optional(),
});

const packageManagerHandler = new PackageManagerHandler();
const kinoContextManager = new KinoContextManager();

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
    const kinoContext = await kinoContextManager.getKinoContext(path);
    if (kinoContext !== null && !parsedOpts.force) {
      logger.error(
        `Kino is already initialized in ${highlighter.info(kinoContext.filepath)}`
      );
      logger.break();
      logger.info(
        `You can run ${highlighter.success("kino init --force")} to update the configuration using the ${highlighter.success("init")} command.`
      );
      process.exit(0);
    }
    logger.info(`Initializing kino in ${highlighter.info(path)}`);
    const { includeTests } = (await prompts([
      {
        type: "confirm",
        name: "includeTests",
        message: `Include ${highlighter.info("tests")} when using ${highlighter.success("kino add")}?`,
        initial: true,
      },
    ])) as { includeTests: boolean };
    const prefixSrc = await doesDirectoryExist(join(path, "src"));
    const { packagesPath } = (await prompts([
      {
        type: "text",
        name: "packagesPath",
        message: `The path to the directory kino should output installed packages, defaults to ${highlighter.info(`${prefixSrc ? "src/" : ""}kino`)}`,
        initial: `${prefixSrc ? "src/" : ""}kino`,
      },
    ])) as { packagesPath: string };
    const detectedPackageManager =
      packageManagerHandler.detectActivePackageManager(path);
    const { packageManager } = (await prompts([
      {
        type: "select",
        name: "packageManager",
        message: `Select the package manager you want to use: (detected ${highlighter.info(detectedPackageManager)})`,
        choices: packageManagers.map((pm) => ({ title: pm, value: pm })),
        initial: packageManagers.indexOf(detectedPackageManager),
      },
    ])) as { packageManager: PackageManager };
    await kinoContextManager.writeKinoJson(path, {
      includeTests,
      resolvedPaths: { packages: packagesPath ?? "kino" },
      packageManager,
    });
    logger.success("Kino has been initialized successfully in your project!");
  });
