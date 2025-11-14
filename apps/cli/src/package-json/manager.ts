import { KinoContext } from "@/kino-context/kino-context";
import { PackageJson, packageJsonSchema } from "./schema";
import fs from "fs";
import paths from "path";
import { PackageManagerHandler } from "./package-managers";
import { exec } from "child_process";

function runCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      if (stderr) console.warn(stderr);
      resolve(stdout);
    });
  });
}

export interface IPackageJsonManager {
  getPackageJson(path: string): Promise<PackageJson>;
  installDependencies(
    kinoContext: KinoContext,
    dependencies: string[]
  ): Promise<void>;
}

export interface PackageIdentifier {
  packageName: string;
  version: string;
}

export type DependenciesInformation = Pick<
  PackageJson,
  "dependencies" | "devDependencies"
>;

export class PackageJsonManager implements IPackageJsonManager {
  constructor(
    private readonly packageManagerHandler = new PackageManagerHandler()
  ) {}

  parsePackageJson(data: unknown): PackageJson {
    return packageJsonSchema.parse(data);
  }

  async getPackageJson(path: string): Promise<PackageJson> {
    const robustPath = path.endsWith("package.json")
      ? path
      : paths.join(path, "package.json");
    const rawKinoPackageJson = fs.readFileSync(robustPath, "utf-8");
    return packageJsonSchema.parse(JSON.parse(rawKinoPackageJson));
  }

  getMissingDependencies(
    a: PackageJson,
    b: PackageJson
  ): DependenciesInformation {
    const missingDependencies: Pick<
      PackageJson,
      "dependencies" | "devDependencies"
    > = {
      dependencies: {},
      devDependencies: {},
    };

    for (const [dep, version] of Object.entries(b.dependencies || {})) {
      if (!a.dependencies || !a.dependencies[dep]) {
        missingDependencies.dependencies![dep] = version;
      }
    }

    for (const [dep, version] of Object.entries(b.devDependencies || {})) {
      if (!a.devDependencies || !a.devDependencies[dep]) {
        missingDependencies.devDependencies![dep] = version;
      }
    }

    return missingDependencies;
  }

  getDependenciesOnDifferentMajorVersion(
    a: PackageJson,
    b: PackageJson
  ): DependenciesInformation {
    const differentVersionDependencies: Pick<
      PackageJson,
      "dependencies" | "devDependencies"
    > = {
      dependencies: {},
      devDependencies: {},
    };

    const getMajorVersion = (version: string): string => {
      return version.split(".")[0].replace(/\D/g, "");
    };

    for (const [dep, version] of Object.entries(b.dependencies || {})) {
      if (
        a.dependencies &&
        a.dependencies[dep] &&
        getMajorVersion(a.dependencies[dep]) !== getMajorVersion(version)
      ) {
        differentVersionDependencies.dependencies![dep] = version;
      }
    }

    for (const [dep, version] of Object.entries(b.devDependencies || {})) {
      if (
        a.devDependencies &&
        a.devDependencies[dep] &&
        getMajorVersion(a.devDependencies[dep]) !== getMajorVersion(version)
      ) {
        differentVersionDependencies.devDependencies![dep] = version;
      }
    }

    return differentVersionDependencies;
  }

  async installDependencies(
    kinoContext: KinoContext,
    packages: Array<string | PackageIdentifier>
  ): Promise<void> {
    const command = this.packageManagerHandler.getInstallCommand(
      kinoContext.kinoJson.packageManager,
      packages
    );
    await runCommand(command);
  }
}
