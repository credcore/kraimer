import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function applyStrategy(
  strategy: string,
  extractionId: number,
  args: any
) {
  let strategyPath = strategy;
  
  if (!path.isAbsolute(strategyPath)) {
    strategyPath = path.join(process.cwd(), strategy);
  }

  try {
    await fs.access(strategyPath);
  } catch {
    throw new Error(`Strategy file not found at path: ${strategyPath}`);
  }

  return executeStrategyFile(strategyPath, extractionId, args);
}

async function executeStrategyFile(
  strategyPath: string,
  extractionId: number,
  args: any
) {
  const argsArray = Object.entries(args).flatMap(([key, value]) => [
    `--${key}`,
    `${value}`,
  ]);
  const command = `${strategyPath} --extraction-id ${extractionId} ${argsArray.join(
    " "
  )}`;
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout;
  } catch (error: any) {
    throw new Error(
      `Failed to execute strategy at ${strategyPath}: ${error.message}`
    );
  }
}
