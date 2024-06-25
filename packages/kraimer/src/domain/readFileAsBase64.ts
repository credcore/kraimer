import { promises as fs } from "fs";

/**
 * Reads a file and returns its content as a base64 encoded string.
 * @param filePath - The path to the file to be read.
 * @returns A promise that resolves to the base64 encoded string of the file content.
 */
export async function readFileAsBase64(filePath: string): Promise<string> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString("base64");
  } catch (error: any) {
    throw new Error(`Error reading file: ${error.message}`);
  }
}
