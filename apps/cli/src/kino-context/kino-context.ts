import { KinoJson } from "@/kino-json/kino-json";
import { PackageJson } from "@/package-json/schema";

export interface KinoContext {
  kinoJson: KinoJson;
  filepath: string;
  rootDirectory: string;
  packageJson: PackageJson;
}
