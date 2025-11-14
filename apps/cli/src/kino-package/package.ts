import { KinoMetadataJson } from "@/kino-metadata-json/metadata-json";
import { PackageJson } from "@/package-json/schema";

export interface FileData {
  filePath: string;
  content: string;
}

export interface KinoPackage {
  packageName: string;
  packageJson: PackageJson;
  metadataJson: KinoMetadataJson;
  files: Array<FileData>;
}
