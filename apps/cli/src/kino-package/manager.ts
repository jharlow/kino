import { KinoContext } from "@/kino-context/kino-context";
import fs from "fs";
import path from "path";
import { kinoPackageJsonToMetadataJson } from "../kino-metadata-json/package-json-to-kino-metadata-json";
import { FileData, KinoPackage } from "./package";
import { getPackageJson } from "@/package-json/get-package-json";
import { doesDirectoryExist } from "@/utils/does-directory-exist";
import { logger } from "@/utils/logger";
import { highlighter } from "@/utils/highlighter";
import { spinner } from "@/utils/spinner";

export interface SuccessfulInstallation {
  success: true;
  packageName: string;
}

export enum FailedInstallationReason {
  AlreadyInstalled = "already_installed",
  NotFound = "not_found",
}

export interface FailedInstallation {
  success: false;
  packageName: string;
  reason: FailedInstallationReason;
}

export type InstallationResult = SuccessfulInstallation | FailedInstallation;

export interface IKinoPackageManager {
  installPackage(
    kinoPackageName: string,
    kinoContext: KinoContext
  ): Promise<InstallationResult>;
}

export class KinoPackageManager implements IKinoPackageManager {
  private async isPackageAlreadyInstalled(
    kinoPackageName: string,
    kinoContext: KinoContext
  ): Promise<boolean> {
    const inboundLocalDirectory = path.join(
      kinoContext.rootDirectory,
      kinoContext.kinoJson.resolvedPaths.packages,
      kinoPackageName
    );
    return await doesDirectoryExist(inboundLocalDirectory);
  }

  private async getPackage(
    kinoPackageName: string,
    kinoContext: KinoContext
  ): Promise<KinoPackage | null> {
    const kinoPackagePath = path.join("../../packages", kinoPackageName);
    const kinoPackageJsonPath = path.join(kinoPackagePath, "package.json");
    const kinoPackageJson = getPackageJson(kinoPackageJsonPath);
    const srcDirectory = path.join(kinoPackagePath, "src");
    const allKinoFiles = fs.readdirSync(srcDirectory);
    const tsKinoFiles = allKinoFiles.filter((fileName) => {
      const testFileEndings = [".test.ts", ".spec.ts"];
      const isTestFileName = !testFileEndings.some((s) => fileName.endsWith(s));
      if (!fileName.endsWith(".ts")) return false;
      if (!kinoContext.kinoJson.includeTests) return isTestFileName;
      return true;
    });
    return {
      packageName: kinoPackageName,
      packageJson: kinoPackageJson,
      metadataJson: kinoPackageJsonToMetadataJson(kinoPackageJson),
      files: tsKinoFiles.map(
        (fileName): FileData => ({
          fileName,
          content: fs.readFileSync(path.join(srcDirectory, fileName), "utf-8"),
        })
      ),
    };
  }

  async installPackage(
    kinoPackageName: string,
    kinoContext: KinoContext
  ): Promise<InstallationResult> {
    const addingSpinner = spinner(`Adding ${kinoPackageName} packages..`);
    const alreadyInstalled = await this.isPackageAlreadyInstalled(
      kinoPackageName,
      kinoContext
    );
    if (alreadyInstalled) {
      logger.break();
      logger.warn(
        `Package ${highlighter.success(kinoPackageName)} is already installed`
      );
      logger.info(
        `To update the package, run ${highlighter.success(`kino update ${kinoPackageName}`)}`
      );
      logger.break();
      addingSpinner.stop();
      return {
        success: false,
        packageName: kinoPackageName,
        reason: FailedInstallationReason.AlreadyInstalled,
      };
    }
    const kinoPackageData = await this.getPackage(kinoPackageName, kinoContext);
    if (kinoPackageData !== null) {
      const inboundLocalDirectory = path.join(
        kinoContext.rootDirectory,
        kinoContext.kinoJson.resolvedPaths.packages,
        kinoPackageData.packageName
      );
      fs.mkdirSync(inboundLocalDirectory, { recursive: true });
      for (const file of kinoPackageData.files) {
        const destPath = path.join(inboundLocalDirectory, file.fileName);
        fs.writeFileSync(destPath, file.content);
      }
      fs.writeFileSync(
        path.join(inboundLocalDirectory, "metadata.json"),
        JSON.stringify(kinoPackageData.metadataJson, null, 2)
      );
      addingSpinner.succeed(
        `Successfully added ${highlighter.success(kinoPackageName)}`
      );
      return { success: true, packageName: kinoPackageName };
    } else {
      logger.warn(`Package ${highlighter.success(kinoPackageName)} not found`);
      addingSpinner.fail(
        `Failed to add ${highlighter.success(kinoPackageName)}`
      );
      return {
        success: false,
        packageName: kinoPackageName,
        reason: FailedInstallationReason.NotFound,
      };
    }
  }
}
