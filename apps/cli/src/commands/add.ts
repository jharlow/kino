import { getKinoConfig } from "@/kino-config/get-kino-config";
import { FsKinoPackageSource } from "@/kino-package-source/fs-source";
import { doesDirectoryExist } from "@/utils/does-directory-exist";
import { highlighter } from "@/utils/highlighter";
import { logger } from "@/utils/logger";
import { spinner } from "@/utils/spinner";
import { Command } from "commander";
import fs from "fs";
import { stat } from "fs/promises";
import path from "path";
import prompts from "prompts";
import { z } from "zod";

const addOptionsSchema = z.object({
  packages: z.array(z.string()),
  cwd: z.string().optional(),
});

const kinoPackageSource = new FsKinoPackageSource();

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
    const configPath = options.cwd ?? process.cwd();
    logger.info(
      `Adding utility functions: ${highlighter.success(options.packages.join(" "))}`
    );
    const kinoConfig = await getKinoConfig(configPath);
    if (kinoConfig === null) {
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
    for (const pkg of options.packages) {
      const addingSpinner = spinner(`Adding ${pkg} packages..`);
      const inboundLocalDirectory = path.join(
        kinoConfig.rootDirectory,
        kinoConfig.config.resolvedPaths.packages,
        pkg
      );
      const alreadyExists = await doesDirectoryExist(inboundLocalDirectory);
      if (alreadyExists) {
        logger.break();
        logger.warn(
          `Package ${highlighter.success(pkg)} already exists in ${highlighter.info(inboundLocalDirectory)}`
        );
        logger.info(
          `To update the package, run ${highlighter.success(`kino update ${pkg}`)}`
        );
        logger.break();
        continue;
      }
      fs.mkdirSync(inboundLocalDirectory, { recursive: true });
      const kinoPackage = await kinoPackageSource.getPackage(
        pkg,
        kinoConfig.config
      );
      if (kinoPackage !== null) {
        fs.mkdirSync(inboundLocalDirectory, { recursive: true });
        for (const file of kinoPackage.files) {
          const destPath = path.join(inboundLocalDirectory, file.fileName);
          fs.writeFileSync(destPath, file.content);
        }
        fs.writeFileSync(
          path.join(inboundLocalDirectory, "metadata.json"),
          JSON.stringify(kinoPackage.metadataJson, null, 2)
        );
        addingSpinner.succeed(`Added ${highlighter.success(pkg)}`);
        logger.break();
      } else {
        logger.warn(`Package ${highlighter.success(pkg)} not found`);
        addingSpinner.fail(`Failed to add ${highlighter.success(pkg)}`);
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
