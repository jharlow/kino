import { KinoContextManager } from "@/kino-context/manager";
import {
  FailedInstallationReason,
  KinoPackageManager,
  PackageSource,
} from "@/kino-package/manager";
import { highlighter } from "@/utils/highlighter";
import { logger } from "@/utils/logger";
import { Command } from "commander";
import { z } from "zod";

const addOptionsSchema = z.object({
  packages: z.array(z.string()),
  cwd: z.string().optional(),
  force: z.boolean().optional(),
});

const kinoContextManager = new KinoContextManager();
const kinoPackageManager = new KinoPackageManager();

export const add = new Command()
  .name("add")
  .description("Add new kino packages")
  .argument("[packages...]", "names of packages to add to your project")
  .option(
    "-c, --cwd <str>",
    "the working directory, defaults to the current working directory"
  )
  .option(
    "-f, --force",
    "force installation even if the package is already installed",
    false
  )
  .action(async (packages, unparsedOptions) => {
    const options = addOptionsSchema.parse({ packages, ...unparsedOptions });
    const configPath = options.cwd ?? process.cwd();
    logger.info(
      `Adding kino packages: ${highlighter.success(options.packages.join(" "))}`
    );
    logger.break();
    const kinoContext = await kinoContextManager.getKinoContext(configPath);
    if (kinoContext === null) {
      logger.error(
        `Kino is not initialized in ${highlighter.info(configPath)}`
      );
      logger.break();
      logger.info(
        `You can run ${highlighter.success("kino init")} to initialize kino in this directory.`
      );
      process.exit(0);
    }
    const packagesAdded: string[] = [];
    const packagesAlreadyInstalled: string[] = [];
    const packagesNotFound: string[] = [];
    for (const kinoPackageName of options.packages) {
      const result = await kinoPackageManager.installPackage(
        kinoPackageName,
        kinoContext,
        { force: options.force ?? false, packageSource: PackageSource.Local }
      );
      if (result.success) {
        packagesAdded.push(result.packageName);
      } else {
        switch (result.reason) {
          case FailedInstallationReason.AlreadyInstalled: {
            packagesAlreadyInstalled.push(result.packageName);
            break;
          }
          case FailedInstallationReason.NotFound: {
            packagesNotFound.push(result.packageName);
            break;
          }
        }
      }
    }
    if (packagesAdded.length === 0) {
      logger.info("All jobs complete, no packages were added");
    } else {
      logger.info(
        "Finished adding packages: " +
          packagesAdded.map((p) => highlighter.success(p)).join(" ")
      );
    }
  });
