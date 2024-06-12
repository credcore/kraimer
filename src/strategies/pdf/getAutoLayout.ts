import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createExtractedField } from "../../domain/createExtractedField.js";
import { getDocumentsInExtraction } from "../../domain/getDocumentsInExtraction.js";
import { saveFileContent } from "../../domain/saveFileContent.js";
import { argsToArray } from "../../process/argsToArray.js";
import { execPythonScript } from "../../process/execPythonScript.js";

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
  })
  .option("print", {
    type: "boolean",
    description: "Print the output",
  })
  .option("debug", {
    type: "boolean",
    description: "Set debug mode",
  }).argv;

const documents = await getDocumentsInExtraction(argv.extractionId);

for (const doc of documents) {
  const fileName = await saveFileContent(doc.fileContentId);

  const pythonScriptPath = path.join(
    __dirname,
    "../../../../python/pdf/get_auto_layout.py"
  );

  const pythonArgs = argsToArray([], { ...argv, pdfPath: fileName });

  const output = await execPythonScript(pythonScriptPath, pythonArgs);

  await createExtractedField(
    argv.extractionId,
    "pdf/auto-layout",
    output,
    "pdf/get-auto-layout",
    "FINISHED"
  );
}

process.exit(0);
