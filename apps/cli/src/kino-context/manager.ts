import { cosmiconfig } from "cosmiconfig";
import fs from "fs";
import path from "path";

import {
  DefaultedKinoJson,
  kinoJson,
  KinoJson,
  kinoJsonSchema,
} from "@/kino-json/kino-json";
import { KinoContext } from "./kino-context";
export interface IKinoContextManager {
  getKinoContext(path?: string): Promise<KinoContext | null>;
  writeKinoJson(path: string, data: KinoJson): Promise<void>;
}

export class KinoContextManager implements IKinoContextManager {
  constructor(
    private readonly explorer = cosmiconfig("kino", {
      searchPlaces: ["kino.json"],
    })
  ) {}

  async getKinoContext(path?: string): Promise<KinoContext | null> {
    const result = await this.explorer.search(path);
    if (result === null) return null;
    const { success, data } = kinoJsonSchema.safeParse(result.config);
    if (!success) return null;
    return {
      kinoJson: data,
      filepath: result.filepath,
      rootDirectory: result.filepath.slice(0, result.filepath.lastIndexOf("/")),
    };
  }

  async writeKinoJson(
    directoryPath: string,
    data: DefaultedKinoJson
  ): Promise<void> {
    fs.writeFileSync(
      path.join(directoryPath, "kino.json"),
      JSON.stringify(kinoJson(data), null, 2)
    );
  }
}
