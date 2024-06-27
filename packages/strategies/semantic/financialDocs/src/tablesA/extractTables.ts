import { setDebug } from "kraimer/dist/config.js";
import { getExtractedFieldByName } from "kraimer/dist/domain/getExtractedFieldByName.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { TablesEntry } from "./TablesEntry.js";
import { PagePngFieldEntry } from "kraimer-pdf-strategies/dist/PagePngFieldEntry.js";
import { saveFileContent } from "kraimer/dist/domain/saveFileContent.js";
import { readFileAsBase64 } from "kraimer/dist/domain/readFileAsBase64.js";
import { Message } from "kraimer/dist/llm/types.js";
import { llmQuery } from "kraimer/dist/llm/llmQuery.js";
import { saveExtractedField } from "kraimer/dist/domain/saveExtractedField.js";

const FIELD_NAME = "semantic/financialDocs/tablesA/tables";
const STRATEGY = "semantic/financialDocs/tablesA/extractTables";

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
Extract the financial tabular data, including the table metadata (title and legends), from the following image. Return the complete tables as a clean, plain JSON object, with values as arrays. Subgroups, totals, and subtotals should be indented. Column headings should be flattened (combined headers merged into every column below them) and listed simply.

Example 1

Input table:

\`\`\`
          MTD PRODUCTS INC
          CONSOLIDATED BALANCE SHEETS
          (Dollars in thousands)
           |       |     |   As of July 31
           |       |     |   2021  |  2020
Assets     |       |     |         |      
           |Cash   |     |   $174  |  $164
           |AccRec |     |   $401  |  $404
           |Invent |     |   $553  |  $425
           |       |Total|  $1168  | $1024
Liabilities|       |     |
           |Debt   |     |   $100  |  $100
           |AccPay |     |   $370  |  $328
           |       |Total|   $470  |  $428
\`\`\`

Expected JSON output:      

\`\`\`json
{
  "metadata": {
    "name": "MTD PRODUCTS INC",
    "title": "CONSOLIDATED BALANCE SHEETS",
    "legend": "(Dollars in thousands)"
  },
  "columns": ["", "", "", "As of July 31 2021", "As of July 31 2020"],
  "rows": [
    ["Assets", "", "", "", ""],
    ["", "Cash", "", "$174", "$164"],
    ["", "AccRec", "", "$401", "$404"],
    ["", "Invent", "", "$553", "$425"],
    ["", "", "Total", "$1168", "$1024"],
    ["Liabilities", "", "", "", ""],
    ["", "Debt", "", "$174", "$164"],
    ["", "AccPay", "", "$401", "$404"],
    ["", "", "Total", "$1168", "$1024"]
  ]
}
\`\`\`

Example 2

Input table:

\`\`\`
Acme Corp
Condensed Consolidated Statements of Operations
(In thousands, except per share information)
                                    Nine months ended    
                                  Sept 30,               
                                   2022       Oct 1, 2021
Operating activities                                     
Net loss                          $ (74,639)  $ (85,610)
Adjustments to reconcile loss:                           
  Depreciation                       16,850      17,908
  Amortization of goodwill           50,610      82,175
  Bad debt and other accts recv         654       (565)
  Deferred income tax expense         1,079         142
\`\`\`

Expected JSON output:      

\`\`\`json
{
  "metadata": {
    "name": "Acme Corp",
    "title": "Condensed Consolidated Statements of Operations",
    "legend": "(In thousands, except per share information)"
  },
  "columns": ["", "", "Nine months ended Sept 30, 2022", "Nine months ended Oct 1, 2021"],
  "rows": [
    ["Operating activities", "", "", ""],
    ["Net loss", "", "$(74,639)", "$(85,610)"],
    ["Adjustments to reconcile loss:", "", "", ""],
    ["", "Depreciation", "16,850", "17,908"],
    ["", "Amortization of goodwill", "50,610", "82,175"],
    ["", "Bad debt and other accts recv", "654", "(565)"],
    ["", "Deferred income tax expense", "1,079", "142"],
  ]
}
\`\`\`

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

await saveExtractedField(
  argv.extractionId,
  FIELD_NAME,
  JSON.stringify(tablesField),
  STRATEGY,
  "FINISHED"
);

process.exit(0);
