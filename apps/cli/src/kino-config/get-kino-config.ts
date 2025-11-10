import { cosmiconfig } from "cosmiconfig";
import { kinoConfigSchema, KinoConfig } from "./schema";

const explorer = cosmiconfig("kino", {
  searchPlaces: ["kino.json"],
});

interface GetKinoConfigResult {
  config: KinoConfig;
  filepath: string;
  rootDirectory: string;
}

export const getKinoConfig = async (
  path?: string
): Promise<GetKinoConfigResult | null> => {
  const result = await explorer.search(path);
  if (result === null) return null;
  const { success, data } = kinoConfigSchema.safeParse(result.config);
  if (!success) return null;
  return {
    config: data,
    filepath: result.filepath,
    rootDirectory: result.filepath.slice(0, result.filepath.lastIndexOf("/")),
  };
};
