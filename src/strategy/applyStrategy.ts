import { exec } from "child_process";
import { promisify } from "util";

export async function applyStrategy(
  strategyPath: string,
  extractionId: number,
  args: any
) {
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

  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(
          new Error(
            `Failed to execute strategy at ${strategyPath}: ${error.message}`
          )
        );
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        resolve(stdout);
      }
    });

    if (child.stdout) {
      child.stdout.pipe(process.stdout);
    }
    if (child.stderr) {
      child.stderr.pipe(process.stderr);
    }
  });
}
