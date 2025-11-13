import fs from "fs";
import { PackageJson, packageJsonSchema } from "./schema";

export const getPackageJson = (path: string): PackageJson => {
  const rawKinoPackageJson = fs.readFileSync(path, "utf-8");
  return packageJsonSchema.parse(JSON.parse(rawKinoPackageJson));
};
