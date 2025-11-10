import { getKinoConfig } from "@/kino-config/get-kino-config";
import { kinoMetadataJsonSchema } from "@/kino-metadata-json/schema";
import { packageJsonSchema } from "@/package-json/schema";
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
import { stat } from "fs/promises";
import { join } from "path";
import prompts from "prompts";
import { z } from "zod";

const addOptionsSchema = z.object({
  packages: z.array(z.string()),
  cwd: z.string().optional(),
});

const runIf =
  <A, B>(fn: (a: A) => B, condition: boolean, otherwiseReturn: B) =>
  (a: A): B => {
    if (condition) {
      return fn(a);
    }
    return otherwiseReturn;
  };

const stripTestFileNames = (fileName: string) =>
  !fileName.endsWith(".test.ts") && !fileName.endsWith(".spec.ts");

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
    const kinoConfig = await getKinoConfig(path);
    if (kinoConfig === null) {
      logger.error(`Kino is not initialized in ${highlighter.info(path)}`);
      logger.break();
      logger.info(
        `You can run ${highlighter.success("kino init")} to initialize kino in this directory.`
      );
      process.exit(0);
    }
    const packagesAdded: string[] = [];
    for (const pkg of options.packages) {
      const addingSpinner = spinner(`Adding ${pkg} packages..`);
      const inboundLocalDirectory = join(
        kinoConfig.rootDirectory,
        kinoConfig.config.resolvedPaths.packages,
        pkg
      );
      const alreadyExists = (await stat(inboundLocalDirectory)).isDirectory();
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
      const kinoPackagePath = join("../../packages", pkg);
      const kinoPackageJsonPath = join(kinoPackagePath, "package.json");
      const rawKinoPackageJson = readFileSync(kinoPackageJsonPath, "utf-8");
      const kinoPackageJson = packageJsonSchema.parse(
        JSON.parse(rawKinoPackageJson)
      );
      const srcDirectory = join(kinoPackagePath, "src");
      const allKinoFiles = readdirSync(srcDirectory);
      const tsKinoFiles = allKinoFiles
        .filter((file) => file.endsWith(".ts"))
        .filter(
          runIf(stripTestFileNames, !kinoConfig.config.includeTests, true)
        );
      mkdirSync(inboundLocalDirectory, { recursive: true });
      for (const file of tsKinoFiles) {
        const filePath = join(srcDirectory, file);
        const destPath = join(inboundLocalDirectory, file);
        copyFileSync(filePath, destPath);
      }
      writeFileSync(
        join(inboundLocalDirectory, "metadata.json"),
        JSON.stringify(kinoMetadataJsonSchema.parse(kinoPackageJson), null, 2)
      );
      addingSpinner.succeed(`Added ${highlighter.success(pkg)}`);
      logger.break();
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
