import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

export async function saveBase64Content(base64String: string): Promise<string> {
  try {
    const fileContent = Buffer.from(base64String, "base64");

    const tempFilePath = path.join(os.tmpdir(), `temp-${Date.now()}.tmp`);
    await fs.writeFile(tempFilePath, fileContent);

    return tempFilePath;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid base64 string")) {
      throw new Error(`Invalid base64 string: ${error.message}`);
    }
    throw error;
  }
}