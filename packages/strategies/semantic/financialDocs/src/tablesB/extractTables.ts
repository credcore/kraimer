import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { TablesEntry } from "./TablesEntry.js";
import { setDebug } from "kraimer/dist/config.js";
import { getExtractedFieldByName } from "kraimer/dist/domain/getExtractedFieldByName.js";
import { PagePngFieldEntry } from "kraimer-pdf-strategies/dist/PagePngFieldEntry.js";
import { saveFileContent } from "kraimer/dist/domain/saveFileContent.js";
import { readFileAsBase64 } from "kraimer/dist/domain/readFileAsBase64.js";
import { Message } from "kraimer/dist/llm/types.js";
import { llmQuery } from "kraimer/dist/llm/llmQuery.js";
import { createExtractedField } from "kraimer/dist/domain/createExtractedField.js";

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
Extract the financial tabular data, including the table title and legends, from the following image. Return the tables as a nested JSON object representing the hierarchy of data in the table. All hierarchical information must be captured, no numbers/cells should be missed, and all numbers must be extremely accurate.

If there are sub-tables containing differing structure, create a parent object and place the tables inside them. Don't try to coalesce different structures.

Describe your extraction summary in detail before producing the JSON. For each table (one or many), first analyze and list the columns.

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
