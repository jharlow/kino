import { KinoMetadataJson } from "@/kino-metadata-json/metadata-json";
import { PackageJson } from "@/package-json/schema";

export const kinoPackageJsonToMetadataJson = (
  packageJson: PackageJson
): KinoMetadataJson => {
  return { version: packageJson.version };
};
