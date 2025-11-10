import { join } from "path";
import { FileData, IKinoPackageSource, KinoPackageData } from "./interface";
import fs from "fs";
import { packageJsonSchema } from "@/package-json/schema";
import { KinoConfig } from "@/kino-config/schema";
import { kinoPackageJsonToMetadataJson } from "./kino-package-json-to-metadata-json";

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

export class FsKinoPackageSource implements IKinoPackageSource {
  async getPackage(
    packageName: string,
    kinoConfig: KinoConfig
  ): Promise<KinoPackageData | null> {
    const kinoPackagePath = join("../../packages", packageName);
    const kinoPackageJsonPath = join(kinoPackagePath, "package.json");
    const rawKinoPackageJson = fs.readFileSync(kinoPackageJsonPath, "utf-8");
    const kinoPackageJson = packageJsonSchema.parse(
      JSON.parse(rawKinoPackageJson)
    );
    const srcDirectory = join(kinoPackagePath, "src");
    const allKinoFiles = fs.readdirSync(srcDirectory);
    const tsKinoFiles = allKinoFiles
      .filter((file) => file.endsWith(".ts"))
      .filter(runIf(stripTestFileNames, !kinoConfig.includeTests, true));
    return {
      packageJson: kinoPackageJson,
      metadataJson: kinoPackageJsonToMetadataJson(kinoPackageJson),
      files: tsKinoFiles.map((fileName): FileData => {
        return {
          fileName,
          content: fs.readFileSync(join(srcDirectory, fileName), "utf-8"),
        };
      }),
    };
  }
}
