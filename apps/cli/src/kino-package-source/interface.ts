import { KinoConfig } from "@/kino-config/schema";
import { KinoMetadataJson } from "@/kino-metadata-json/schema";
import { PackageJson } from "@/package-json/schema";

export interface FileData {
  fileName: string;
  content: string;
}

export interface KinoPackageData {
  packageJson: PackageJson;
  metadataJson: KinoMetadataJson;
  files: Array<FileData>;
}

export interface IKinoPackageSource {
  getPackage(
    packageName: string,
    kinoConfig: KinoConfig
  ): Promise<KinoPackageData | null>;
}
