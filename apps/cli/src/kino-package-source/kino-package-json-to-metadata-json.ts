import { KinoMetadataJson } from "@/kino-metadata-json/schema";
import { PackageJson } from "@/package-json/schema";

export const kinoPackageJsonToMetadataJson = (
  packageJson: PackageJson
): KinoMetadataJson => {
  return { version: packageJson.version };
};
