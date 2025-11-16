import { KinoContext } from "@/kino-context/kino-context";
import fs from "fs";
import path from "path";
import { kinoPackageJsonToMetadataJson } from "../kino-metadata-json/package-json-to-kino-metadata-json";
import { FileData, KinoPackage } from "./package";
import { doesDirectoryExist } from "@/utils/does-directory-exist";
import { logger } from "@/utils/logger";
import { highlighter } from "@/utils/highlighter";
import { spinner } from "@/utils/spinner";
import {
  DependenciesInformation,
  PackageIdentifier,
  PackageJsonManager,
} from "@/package-json/manager";
import prompts from "prompts";
import z from "zod";

export enum PackageSource {
  Local = "local",
  Remote = "remote",
}

interface GetPackageOptions {
  packageSource: PackageSource;
}

export interface InstallPackageOptions {
  force: boolean;
  packageSource: PackageSource;
}

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
    kinoContext: KinoContext,
    options: InstallPackageOptions
  ): Promise<InstallationResult>;
}

export class KinoPackageManager implements IKinoPackageManager {
  constructor(private readonly packageJsonManager = new PackageJsonManager()) {}

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

  private async getLocalPackage(
    kinoPackageName: string,
    kinoContext: KinoContext
  ): Promise<KinoPackage | null> {
    const kinoPackagePath = path.join("../../packages", kinoPackageName);
    const kinoPackageJsonPath = path.join(kinoPackagePath, "package.json");
    const kinoPackageJson =
      await this.packageJsonManager.getPackageJson(kinoPackageJsonPath);
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
          filePath: fileName,
          content: fs.readFileSync(path.join(srcDirectory, fileName), "utf-8"),
        })
      ),
    };
  }

  private async getRemotePackage(
    kinoPackageName: string
  ): Promise<KinoPackage | null> {
    const fetchingSpinner = spinner(
      `Fetching package ${highlighter.success(kinoPackageName)} remotely...`
    );
    const githubFileSchema = z.object({
      name: z.string(),
      path: z.string(),
      url: z.url(),
      download_url: z.url().nullable(),
    });
    const githubResponseSchema = z.array(githubFileSchema);
    const isDirectory = (file: z.infer<typeof githubFileSchema>): boolean =>
      file.download_url === null;
    const getGithubFileContents = async (
      path?: string
    ): Promise<Array<FileData>> => {
      const packageAccessorUrl = `https://api.github.com/repos/jharlow/kino/contents/packages/${kinoPackageName}/src${path ?? ""}`;
      const response = await fetch(packageAccessorUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch package files from GitHub: ${response.status} ${response.statusText}`
        );
      }
      const filesData = await response.json();
      const parsedData = githubResponseSchema.parse(filesData);
      const filesToFetch = parsedData.filter((file) => !isDirectory(file));
      const fileData = await Promise.all(
        filesToFetch.map(async (file) => {
          if (file.download_url === null) {
            throw new Error(
              `Expected a file but got a directory for path: ${file.path}`
            );
          }
          const fileResponse = await fetch(file.download_url);
          if (!fileResponse.ok) {
            throw new Error(
              `Failed to fetch file content from GitHub: ${fileResponse.status} ${fileResponse.statusText}`
            );
          }
          const content = await fileResponse.text();
          return {
            filePath: file.path.slice(
              `packages/${kinoPackageName}/src/`.length
            ),
            content,
          };
        })
      );
      const directoriesToUnpack = parsedData.filter(isDirectory);
      const additionalFileData = await Promise.all(
        directoriesToUnpack.map(async (dir) =>
          getGithubFileContents(
            dir.path.slice(`packages/${kinoPackageName}/src`.length)
          )
        )
      );
      return fileData.concat(...additionalFileData);
    };
    try {
      const packageJsonRes = await fetch(
        `https://raw.githubusercontent.com/jharlow/kino/main/packages/${kinoPackageName}/package.json`
      );
      const packageJsonText = await packageJsonRes.json();
      const packageJson =
        this.packageJsonManager.parsePackageJson(packageJsonText);
      const files = await getGithubFileContents();
      fetchingSpinner.succeed(
        `Fetched package ${highlighter.success(kinoPackageName)} remotely`
      );
      logger.break();
      return {
        packageName: kinoPackageName,
        metadataJson: kinoPackageJsonToMetadataJson(packageJson),
        packageJson,
        files,
      };
    } catch {
      fetchingSpinner.fail(
        `Failed to fetch package ${highlighter.success(kinoPackageName)} remotely`
      );
      logger.break();
      return null;
    }
  }

  private async getPackage(
    kinoPackageName: string,
    kinoContext: KinoContext,
    options: GetPackageOptions
  ): Promise<KinoPackage | null> {
    switch (options.packageSource) {
      case PackageSource.Local:
        return this.getLocalPackage(kinoPackageName, kinoContext);
      case PackageSource.Remote:
        return this.getRemotePackage(kinoPackageName);
    }
  }

  async installPackage(
    kinoPackageName: string,
    kinoContext: KinoContext,
    options: InstallPackageOptions
  ): Promise<InstallationResult> {
    const addingSpinner = spinner(`Adding ${kinoPackageName} package...`);
    const alreadyInstalled = await this.isPackageAlreadyInstalled(
      kinoPackageName,
      kinoContext
    );
    if (alreadyInstalled && !options.force) {
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
    const kinoPackageData = await this.getPackage(
      kinoPackageName,
      kinoContext,
      options
    );
    if (kinoPackageData !== null) {
      const convertToPackageIdentifier = (
        dependenciesInformation: DependenciesInformation
      ): Array<PackageIdentifier> =>
        Object.entries(dependenciesInformation.dependencies ?? {}).map(
          ([packageName, version]): PackageIdentifier => ({
            packageName,
            version,
          })
        );
      const missingDependencies = convertToPackageIdentifier(
        this.packageJsonManager.getMissingDependencies(
          kinoContext.packageJson,
          kinoPackageData.packageJson
        )
      );
      const dependenciesToInstall: Array<PackageIdentifier> = [];
      if (missingDependencies.length > 0) {
        logger.warn(
          `${highlighter.success(kinoPackageName)} relies on additional dependencies which your project is missing: \n${missingDependencies.map((pi) => `- ${pi.packageName}@${pi.version}`).join("\n")}`
        );
        const { installMissingDependencies } = await prompts({
          type: "confirm",
          name: "installMissingDependencies",
          message: "Do you want to install the missing dependencies?",
        });
        logger.break();
        if (installMissingDependencies) {
          dependenciesToInstall.push(...missingDependencies);
        }
      }
      const dependenciesOnDifferentMajorVersion = convertToPackageIdentifier(
        this.packageJsonManager.getDependenciesOnDifferentMajorVersion(
          kinoContext.packageJson,
          kinoPackageData.packageJson
        )
      );
      if (dependenciesOnDifferentMajorVersion.length > 0) {
        logger.warn(
          `${highlighter.success(kinoPackageName)} relies on different major versions of some dependencies than your project: \n${dependenciesOnDifferentMajorVersion.map((pi) => `- ${pi.packageName}@${pi.version}`).join("\n")}`
        );
        const { installMajorVersionDependencies } = await prompts({
          type: "confirm",
          name: "installMajorVersionDependencies",
          message:
            "Do you want to update these packages to the versions required by the package?",
        });
        logger.break();
        if (installMajorVersionDependencies) {
          dependenciesToInstall.push(...dependenciesOnDifferentMajorVersion);
        }
      }
      if (dependenciesToInstall.length > 0) {
        const spinnerInstall = spinner(
          `Installing dependencies for ${kinoPackageName}...`
        );
        await this.packageJsonManager.installDependencies(
          kinoContext,
          dependenciesToInstall
        );
        spinnerInstall.succeed(`Installed dependencies for ${kinoPackageName}`);
        logger.break();
      }
      const inboundLocalDirectory = path.join(
        kinoContext.rootDirectory,
        kinoContext.kinoJson.resolvedPaths.packages,
        kinoPackageData.packageName
      );
      fs.mkdirSync(inboundLocalDirectory, { recursive: true });
      for (const file of kinoPackageData.files) {
        const destPath = path.join(inboundLocalDirectory, file.filePath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, file.content);
      }
      fs.writeFileSync(
        path.join(inboundLocalDirectory, "metadata.json"),
        JSON.stringify(kinoPackageData.metadataJson, null, 2)
      );
      addingSpinner.succeed(
        `Successfully added ${highlighter.success(kinoPackageName)}`
      );
      logger.break();
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
