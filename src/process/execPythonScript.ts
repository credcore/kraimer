import { argsToArray } from "./argsToArray.js";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function execPythonScript(
  pythonScriptPath: string,
  positionals: string[],
  scriptOpts: Record<string, unknown>
): Promise<string> {
  const args = [pythonScriptPath]
    .concat(positionals)
    .concat(argsToArray(scriptOpts));

  try {
    const { stdout, stderr } = await execFileAsync("python", args as string[]);

    if (stderr) {
      throw new Error(`Error: ${stderr}`);
    } else {
      return stdout;
    }
  } catch (error) {
    throw new Error(`Execution error: ${error}`);
  }
}
