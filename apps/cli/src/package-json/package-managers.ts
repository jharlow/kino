import { notNull } from "@/utils/not-null";
import fs from "fs";
import path from "path";
import { PackageIdentifier } from "./manager";

export enum PackageManager {
  NPM = "npm",
  YARN = "yarn",
  PNPM = "pnpm",
}

export const packageManagers = Object.values(PackageManager);

export interface InstallCommandOptions {
  devDependency?: boolean;
}

export interface IPackageManagerHandler {
  getInstallCommand(
    packageManager: PackageManager,
    packages: string[],
    options?: InstallCommandOptions
  ): string;
  detectActivePackageManager(path: string): PackageManager;
}

export class PackageManagerHandler implements IPackageManagerHandler {
  getInstallCommand(
    packageManager: PackageManager,
    packages: Array<string | PackageIdentifier>,
    options: InstallCommandOptions = { devDependency: false }
  ): string {
    const packageManagerBaseProgram: Record<PackageManager, string> = {
      [PackageManager.NPM]: "npm",
      [PackageManager.YARN]: "yarn",
      [PackageManager.PNPM]: "pnpm",
    };
    const packageManagersInstallCommand: Record<PackageManager, string> = {
      [PackageManager.NPM]: "install",
      [PackageManager.YARN]: "add",
      [PackageManager.PNPM]: "add",
    };
    const packageManagersDevDependencyArgument: Record<PackageManager, string> =
      {
        [PackageManager.NPM]: "--save-dev",
        [PackageManager.YARN]: "--dev",
        [PackageManager.PNPM]: "-D",
      };
    const program = packageManagerBaseProgram[packageManager];
    const command = packageManagersInstallCommand[packageManager];
    const devArg = options.devDependency
      ? packageManagersDevDependencyArgument[packageManager]
      : null;
    const packageList = packages
      .map((pkg) =>
        typeof pkg === "string" ? pkg : `${pkg.packageName}@${pkg.version}`
      )
      .join(" ");
    return [program, command, devArg, packageList].filter(notNull).join(" ");
  }

  detectActivePackageManager(directoryPath: string): PackageManager {
    const lockFiles: Record<PackageManager, string> = {
      [PackageManager.NPM]: "package-lock.json",
      [PackageManager.YARN]: "yarn.lock",
      [PackageManager.PNPM]: "pnpm-lock.yaml",
    };
    let currentPath = directoryPath;
    while (true) {
      for (const [manager, lockFile] of Object.entries(lockFiles)) {
        if (fs.existsSync(path.join(currentPath, lockFile))) {
          return manager as PackageManager;
        }
      }
      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        break; // Reached the root directory
      }
      currentPath = parentPath;
    }
    throw new Error("No lock file found. Unable to detect package manager.");
  }
}
