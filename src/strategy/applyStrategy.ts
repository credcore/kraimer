import { exec } from "child_process";

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
  const argsArray = Object.entries(args)
    .filter((x) => !["extraction-id", "extractionId", "print"].includes(x[0]))
    .flatMap(([key, value]) => [`--${key}`, `${value}`]);
  const command = `${strategyPath} --extraction-id ${extractionId} ${argsArray.join(
    " "
  )}`;

  return new Promise<string | void>((resolve, reject) => {
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

    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on("error", (error) => {
      reject(
        new Error(
          `Failed to execute strategy at ${strategyPath}: ${error.message}`
        )
      );
    });
  });
}
