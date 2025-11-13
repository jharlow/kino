import { KinoContext } from "@/kino-context/kino-context";
import { PackageJson, packageJsonSchema } from "./schema";
import fs from "fs";
import paths from "path";

export interface IPackageJsonManager {
  getPackageJson(path: string): Promise<PackageJson>;
  installDependency(
    kinoContext: KinoContext,
    dependencies: string[]
  ): Promise<void>;
}

export class PackageJsonManager implements IPackageJsonManager {
  async getPackageJson(path: string): Promise<PackageJson> {
    const robustPath = path.endsWith("package.json")
      ? path
      : paths.join(path, "package.json");
    const rawKinoPackageJson = fs.readFileSync(robustPath, "utf-8");
    return packageJsonSchema.parse(JSON.parse(rawKinoPackageJson));
  }

  async installDependency(
    kinoContext: KinoContext,
    dependencies: string[]
  ): Promise<void> {
    const { exec } = await import("child_process");
    const util = await import("util");
    const execPromise = util.promisify(exec);
    const command = `npm install ${dependencies.join(" ")}`;
    await execPromise(command, { cwd: kinoContext.rootDirectory });
  }
}
