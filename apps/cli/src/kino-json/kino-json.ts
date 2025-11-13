import { PackageManager } from "@/package-json/package-managers";
import z from "zod";

export const kinoJsonSchema = z.object({
  resolvedPaths: z.object({ packages: z.string() }),
  includeTests: z.boolean().default(true),
  packageManager: z.enum(PackageManager),
});

export type KinoJson = z.infer<typeof kinoJsonSchema>;

export type DefaultedKinoJson = Partial<KinoJson> &
  Pick<KinoJson, "packageManager">;

export const kinoJson = (data: DefaultedKinoJson) => {
  return kinoJsonSchema.parse({
    includeTests: true,
    resolvedPaths: { packages: "kino" },
    ...data,
  } satisfies KinoJson);
};
