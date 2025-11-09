import { cosmiconfig } from "cosmiconfig";
import { z } from "zod";

export const configSchema = z.object({
  resolvedPaths: z.object({
    packages: z.string(),
  }),
  includeTests: z.boolean().default(true),
});

export type KinoConfig = z.infer<typeof configSchema>;

export const kinoConfig = (config: KinoConfig) => {
  return configSchema.parse(config);
};

const explorer = cosmiconfig("kino", {
  searchPlaces: ["kino.json"],
});

export const getConfig = async (
  path?: string
): Promise<{ config: KinoConfig; filepath: string } | null> => {
  const result = await explorer.search(path);
  if (result === null) return null;
  const { success, data } = configSchema.safeParse(result.config);
  if (!success) return null;
  return { config: data, filepath: result.filepath };
};
