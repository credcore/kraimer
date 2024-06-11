import { randomBytes } from "crypto";

export function randomString(): string {
  // Generate 16 random bytes
  const buffer = randomBytes(16);

  // Convert bytes to a hexadecimal string
  return buffer.toString("hex");
}
