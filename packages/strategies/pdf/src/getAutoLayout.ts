import { setDebug } from "kraimer/dist/config.js";
import { getDocumentsInExtraction } from "kraimer/dist/domain/getDocumentsInExtraction.js";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { AutoLayoutFieldEntry } from "./AutoLayoutFieldEntry.js";
import { saveFileContent } from "kraimer/dist/domain/saveFileContent.js";
import { argsToArray } from "kraimer/dist/process/argsToArray.js";
import { execPythonScript } from "kraimer/dist/process/execPythonScript.js";
import { createExtractedField } from "kraimer/dist/domain/createExtractedField.js";

const FIELD_NAME = "pdf/autoLayout";
const STRATEGY = "pdf/getAutoLayout";

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

if (argv.debug) {
  setDebug(true);
}

const documents = await getDocumentsInExtraction(argv.extractionId);

const autoLayoutField = {
  documents: [] as AutoLayoutFieldEntry[],
};

for (const doc of documents) {
  const fileName = await saveFileContent(doc.fileContentId);

  const pythonScriptPath = path.join(
    __dirname,
    "../../../../python/libs/pdf/get_auto_layout.py"
  );

  const pythonArgs = argsToArray([], { ...argv, pdfPath: fileName });

  const output = JSON.parse(
    await execPythonScript(pythonScriptPath, pythonArgs)
  );

  autoLayoutField.documents.push({
    id: doc.id,
    name: doc.name,
    content: output,
  });
}

await createExtractedField(
  argv.extractionId,
  FIELD_NAME,
  JSON.stringify(autoLayoutField),
  STRATEGY,
  "FINISHED"
);

process.exit(0);
