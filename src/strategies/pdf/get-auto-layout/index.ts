import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createExtractedField } from "../../../domain/createExtractedField.js";
import { getDocumentsInExtraction } from "../../../domain/getDocumentsInExtraction.js";
import { saveFileContent } from "../../../domain/saveFileContent.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const argv = await yargs(hideBin(process.argv))
  .option("extractionId", {
    type: "number",
    demandOption: true,
    describe: "ID of the extraction",
  })
  .option("startPage", {
    type: "number",
    default: 1,
    describe: "Page to start extracting from",
  })
  .option("endPage", {
    type: "number",
    describe: "Page to end extracting at",
  })
  .option("xTolerance", {
    type: "number",
    default: 3,
    describe: "Tolerance for x-coordinate",
  })
  .option("yTolerance", {
    type: "number",
    default: 3,
    describe: "Tolerance for y-coordinate",
  })
  .option("yDensity", {
    type: "number",
    default: 10,
    describe: "Density for y-coordinate",
  }).argv;

const execFileAsync = promisify(execFile);

const documents = await getDocumentsInExtraction(argv.extractionId);

for (const doc of documents) {
  const fileName = await saveFileContent(doc.id);

  const pythonScriptPath = path.join(
    __dirname,
    "../../../../python/pdf/get_auto_layout.py"
  );

  const args = [
    pythonScriptPath,
    fileName,
    "--start_page",
    argv.startPage,
    "--end_page",
    argv.endPage,
    "--x_tolerance",
    argv.xTolerance,
    "--y_tolerance",
    argv.yTolerance,
    "--y_density",
    argv.yDensity,
  ].filter((arg) => arg !== undefined); // Remove undefined args

  try {
    const { stdout, stderr } = await execFileAsync("python", args as string[]);

    if (stderr) {
      console.error(`Error: ${stderr}`);
      continue;
    }

    await createExtractedField(
      argv.extractionId,
      "pdf/auto_layout",
      stdout,
      "pdf/get_auto_layout",
      "FINISHED"
    );
  } catch (error) {
    console.error(`Execution error: ${error}`);
  }
}

process.exit(0);
