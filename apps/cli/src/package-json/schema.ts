import z from "zod";

export const packageJsonSchema = z
  .object({
    version: z.string(),
    dependencies: z.record(z.string(), z.string()).optional(),
    devDependencies: z.record(z.string(), z.string()).optional(),
  })
  .loose();

export type PackageJson = z.infer<typeof packageJsonSchema>;
