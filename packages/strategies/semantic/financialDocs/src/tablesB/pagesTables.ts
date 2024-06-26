import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { setDebug } from "kraimer/dist/config.js";
import { getExtractedFieldByName } from "kraimer/dist/domain/getExtractedFieldByName.js";
import { PagePngFieldEntry } from "kraimer-pdf-strategies/dist/PagePngFieldEntry.js";
import { saveFileContent } from "kraimer/dist/domain/saveFileContent.js";
import { readFileAsBase64 } from "kraimer/dist/domain/readFileAsBase64.js";
import { Message } from "kraimer/dist/llm/types.js";
import { llmQuery } from "kraimer/dist/llm/llmQuery.js";
import { createExtractedField } from "kraimer/dist/domain/createExtractedField.js";
import { PagesTablesFieldEntry } from "./PagesTablesFieldEntry.js";

const FIELD_NAME = "semantic/financialDocs/tablesB/pageTables";
const STRATEGY = "semantic/financialDocs/tablesB/pageTables";

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
This image is a page from financial document. Check the image carefully to detect if there are any tables in it. 
Tables need not necessarily have lines separating rows; instead look for the presence of columnar data in any form.
You must not miss any tables.

You must respond with the following JSON.

\`\`\`json
{
  "tables": [
    {
      "name": "Q1 Financial Data",
      "summary": "This table contains Q1 2024 financial data for Random Corp"
    },
    {
      "name": "Q2 Financial Data",
      "summary": "This table contains Q1 2024 financial data for Random Corp"
    }
  ]
}

If no tables are found, the array can be empty.
{
  "tables": []
}
\`\`\`

Summarize your analysis before producing the JSON. 
  `;

const pngs = await getExtractedFieldByName(argv.extractionId, "pdf/pagePngs");

const documents = JSON.parse(pngs.value).documents as PagePngFieldEntry[];

const tablesField = {
  documents: [] as PagesTablesFieldEntry[],
};

for (const doc of documents) {
  const docEntry: PagesTablesFieldEntry = {
    id: doc.id,
    name: doc.name,
    content: {
      pages: [],
    },
  };

  tablesField.documents.push(docEntry);

  let pageNumber = 0;
  for (const file of doc.content.files) {
    pageNumber++;
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
            image_url: { url: base64Url, detail: "high" },
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

    if (result.json && result.json.tables && result.json.tables.length > 0) {
      docEntry.content.pages.push({
        pageNumber,
        tables: result.json.tables,
      });
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
