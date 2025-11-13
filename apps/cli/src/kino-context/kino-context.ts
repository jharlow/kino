import { KinoJson } from "@/kino-json/kino-json";

export interface KinoContext {
  kinoJson: KinoJson;
  filepath: string;
  rootDirectory: string;
}
