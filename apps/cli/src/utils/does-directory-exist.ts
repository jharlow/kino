import fs from "fs/promises";

export const doesDirectoryExist = async (path: string) => {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
};
