import z from "zod";

export const kinoConfigSchema = z.object({
  resolvedPaths: z.object({ packages: z.string() }),
  includeTests: z.boolean().default(true),
});

export type KinoConfig = z.infer<typeof kinoConfigSchema>;

export const kinoConfig = (config: KinoConfig) => {
  return kinoConfigSchema.parse(config);
};
