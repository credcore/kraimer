import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getExtractedFieldByName } from "../../../../domain/getExtractedFieldByName.js";
import { saveFileContent } from "../../../../domain/saveFileContent.js";
import { PagePngFieldEntry } from "../../../pdf/PagePngFieldEntry.js";
import { readFileAsBase64 } from "../../../../domain/readFileAsBase64.js";
import { llmQuery } from "../../../../llm/llmQuery.js";
import { Message } from "../../../../llm/types.js";
import { setDebug } from "../../../../config.js";
import { TablesEntry } from "./TablesEntry.js";
import { createExtractedField } from "../../../../domain/createExtractedField.js";

const FIELD_NAME = "semantic/financialDocs/tablesB/tables";
const STRATEGY = "semantic/financialDocs/tablesB/extractTables";

const argv = await yargs(hideBin(process.argv))
  .option("extractionId", {
    type: "number",
    demandOption: true,
    describe: "ID of the extraction",
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

const query = `
Extract the financial tabular data, including the table title and legends, from the following image. Return the tables as a nested JSON object representing the hierarchy of data in the table. All hierarchical information must be captured, and all numbers must be extremely accurate.

In addition, add another property to the JSON result called "layout." This should capture all necessary information to convert the captured data above to an Excel sheet if required. This can be plain text, essentially describing what you're seeing so that the reader can create an Excel sheet out of it. This means that it may include header names, labels, colspans, etc., and how data is organized, etc. Be as descriptive as you want.

If no tabular data is present, return an empty JSON object: {}
  `;

const pngs = await getExtractedFieldByName(argv.extractionId, "pdf/pagePngs");

const documents = JSON.parse(pngs.value).documents as PagePngFieldEntry[];

const tablesField = {
  documents: [] as TablesEntry[],
};

for (const doc of documents) {
  const docEntry = {
    id: doc.id,
    name: doc.name,
    content: {
      tables: [] as any[],
    },
  };

  tablesField.documents.push(docEntry);

  for (const file of doc.content.files) {
    const pngFile = await saveFileContent(file.id);
    const base64 = await readFileAsBase64(pngFile);
    const base64Url = `data:image/png;base64,${base64}`;
    const messages: Message[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: query,
          },
          {
            type: "image_url",
            image_url: { url: base64Url },
          },
        ],
      },
    ];
    const result = await llmQuery(
      argv.extractionId,
      "gpt-4o",
      messages,
      true,
      10
    );

    if (result.json && Object.keys(result.json).length > 0) {
      docEntry.content.tables.push(result.json);
    }
  }
}

await createExtractedField(
  argv.extractionId,
  FIELD_NAME,
  JSON.stringify(tablesField),
  STRATEGY,
  "FINISHED"
);

process.exit(0);
