import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getDocumentsInExtraction } from "../../../domain/getDocumentsInExtraction.js";
import { saveFileContent } from "../../../domain/saveFileContent.js";

const argv = await yargs(hideBin(process.argv)).option("extractionId", {
  type: "number",
  demandOption: true,
}).argv;

const documents = await getDocumentsInExtraction(argv.extractionId);

console.log(argv, { documents });

for (const doc of documents) {
  const fileName = await saveFileContent(doc.id);
  console.log(fileName);
}

process.exit(0);
