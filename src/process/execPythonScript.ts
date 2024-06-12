import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function execPythonScript(
  pythonScriptPath: string,
  args: string[]
): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync(
      "python",
      [pythonScriptPath].concat(args),
      {
        maxBuffer: 256 * 1024 * 1024, // 256 MEGS!
      }
    );

    if (stderr) {
      throw new Error(`Error: ${stderr}`);
    } else {
      return stdout;
    }
  } catch (error) {
    throw new Error(`Execution error: ${error}`);
  }
}
