import { setDebug } from "kraimer/dist/config.js";
import { getDocumentsInExtraction } from "kraimer/dist/domain/getDocumentsInExtraction.js";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { PagePngFieldEntry } from "./PagePngFieldEntry.js";
import { saveFileContent } from "kraimer/dist/domain/saveFileContent.js";
import { argsToArray } from "kraimer/dist/process/argsToArray.js";
import { execPythonScript } from "kraimer/dist/process/execPythonScript.js";
import { FileContent } from "kraimer/dist/domain/types.js";
import { createFileContent } from "kraimer/dist/domain/createFileContent.js";
import { saveExtractedField } from "kraimer/dist/domain/saveExtractedField.js";

const FIELD_NAME = "pdf/pagePngs";
const STRATEGY = "pdf/pageToPng";

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
    describe: "Page to start converting from",
  })
  .option("endPage", {
    type: "number",
    describe: "Page to end converting at",
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

const pageToPngField = {
  documents: [] as PagePngFieldEntry[],
};

for (const doc of documents) {
  const fileName = await saveFileContent(doc.fileContentId);

  const pythonScriptPath = path.join(
    __dirname,
    "../../../../python/libs/pdf/page_to_png.py"
  );

  const pythonArgs = argsToArray([], { ...argv, pdfPath: fileName });

  const output = await execPythonScript(pythonScriptPath, pythonArgs);
  const pngFilePaths = JSON.parse(output).pages;

  const fileContentList: FileContent[] = [];

  for (const pngFilePath of pngFilePaths) {
    const fileContentId = await createFileContent(pngFilePath, "image/png");
    fileContentList.push(fileContentId);
  }

  pageToPngField.documents.push({
    id: doc.id,
    name: doc.name,
    content: {
      files: fileContentList,
    },
  });
}

await saveExtractedField(
  argv.extractionId,
  FIELD_NAME,
  JSON.stringify(pageToPngField),
  STRATEGY,
  "FINISHED"
);

process.exit(0);
