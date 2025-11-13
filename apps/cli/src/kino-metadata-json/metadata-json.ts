import z from "zod";

export const kinoMetadataJsonSchema = z.object({ version: z.string() });

export type KinoMetadataJson = z.infer<typeof kinoMetadataJsonSchema>;
