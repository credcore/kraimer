import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getExtractedFieldByName } from "../../../domain/getExtractedFieldByName.js";
import { saveFileContent } from "../../../domain/saveFileContent.js";
import { PagePngFieldEntry } from "../../pdf/PagePngFieldEntry.js";
import { readFileAsBase64 } from "../../../domain/readFileAsBase64.js";
import { llmQuery } from "../../../llm/llmQuery.js";
import { Message } from "../../../llm/types.js";
import { setDebug } from "../../../config.js";

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
  Extract the financial tabular data, including the table title and legends, from the following image.
  Return the complete tables as a clean, plain JSON object.
  Totals and subtotals should be indented. Column labels should always be in the last level of the hierarchy. For example:
  
  \`\`\`json
  {
    "header": {
      "name": "MTD PRODUCTS INC",
      "title": "CONSOLIDATED BALANCE SHEETS",
      "legend": "(Dollars in thousands)"
    },
    "Shareholder's equity": {
      "Retained earnings": {
        "March 30, 2024": "$$128,088",
        "December 30, 2023": "$$128,832"
      },
      "Accumulated other comprehensive income (loss)": {
        "March 30, 2024": "$$4,437",
        "December 30, 2023": "($$313)"
      },
      "Total shareholder's equity": {
        "March 30, 2024": "$$206,093",
        "December 30, 2023": "$$512,611"
      },
      "Total liabilities and shareholder's equity": {
        "March 30, 2024": "$$3,696,823",
        "December 30, 2023": "$$3,662,728"
      }
    }
  }
  \`\`\`
  
  If no tabular data is present, return an empty JSON object: {}
  `;

const pngs = await getExtractedFieldByName(argv.extractionId, "pdf/pagePngs");

const documents = JSON.parse(pngs.value).documents as PagePngFieldEntry[];

for (const doc of documents) {
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
  }
}

process.exit(0);
