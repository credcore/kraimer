import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { addDocumentGroupProperty } from "./domain/addDocumentGroupProperty.js";
import { addDocumentProperty } from "./domain/addDocumentProperty.js";
import { addDocumentToGroup } from "./domain/addDocumentToGroup.js";
import { addExtractionProperty } from "./domain/addExtractionProperty.js";
import { createDocument } from "./domain/createDocument.js";
import { createDocumentGroup } from "./domain/createDocumentGroup.js";
import { createExtractedField } from "./domain/createExtractedField.js";
import { createExtractedFieldError } from "./domain/createExtractedFieldError.js";
import { createExtraction } from "./domain/createExtraction.js";
import { deleteDocument } from "./domain/deleteDocument.js";
import { deleteDocumentGroup } from "./domain/deleteDocumentGroup.js";
import { deleteExtractedField } from "./domain/deleteExtractedField.js";
import { deleteExtractedFieldError } from "./domain/deleteExtractedFieldError.js";
import { deleteExtraction } from "./domain/deleteExtraction.js";
import { getDocument } from "./domain/getDocument.js";
import { getDocumentGroup } from "./domain/getDocumentGroup.js";
import { getDocumentGroupProperty } from "./domain/getDocumentGroupProperty.js";
import {
  DocumentGroupFilter,
  getDocumentGroups,
} from "./domain/getDocumentGroups.js";
import { getDocumentProperties } from "./domain/getDocumentProperties.js";
import { getDocumentProperty } from "./domain/getDocumentProperty.js";
import { DocumentFilter, getDocuments } from "./domain/getDocuments.js";
import { getExtractedField } from "./domain/getExtractedField.js";
import { getExtractedFieldByName } from "./domain/getExtractedFieldByName.js";
import { getExtractedFieldError } from "./domain/getExtractedFieldError.js";
import { getExtractedFieldErrors } from "./domain/getExtractedFieldErrors.js";
import { getExtractedFields } from "./domain/getExtractedFields.js";
import { getExtraction } from "./domain/getExtraction.js";
import { getExtractionProperty } from "./domain/getExtractionProperty.js";
import { getExtractions } from "./domain/getExtractions.js";
import { removeDocumentGroupProperty } from "./domain/removeDocumentGroupProperty.js";
import { removeDocumentProperty } from "./domain/removeDocumentProperty.js";
import { removeExtractionProperty } from "./domain/removeExtractionProperty.js";
import { log } from "./logger/log.js";
import { applyStrategy } from "./strategy/applyStrategy.js";
import path from "path";
import { readFileSync } from "fs";
import { OrderByEnum, TaskStatusEnum } from "./domain/types.js";

function getPackageVersion(): string {
  const pkg = path.join(__dirname, "../package.json");
  const packageJSON = JSON.parse(readFileSync(pkg, "utf8"));
  return packageJSON.version;
}

const argv = yargs(hideBin(process.argv))
  // Version command
  .command("version", "Show application version", {}, () => {
    log(getPackageVersion());
  })
  // Document commands
  .command(
    "document create",
    "Create a document",
    (yargs) =>
      yargs
        .option("name", { type: "string", demandOption: true })
        .option("description", { type: "string" })
        .option("type", { type: "string", demandOption: true })
        .option("filePath", { type: "string", demandOption: true }),
    (args) => {
      const result = createDocument(
        args.name,
        args.description ?? "",
        args.type,
        args.filePath
      );
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "document delete",
    "Delete a document",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      deleteDocument(args.id);
    }
  )
  .command(
    "document get",
    "Get a document",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      const result = getDocument(args.id);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "document get_all",
    "Get all documents",
    (yargs) =>
      yargs
        .option("startFrom", { type: "number", default: 0 })
        .option("count", { type: "number", default: 10 })
        .option("filterName", { type: "string" })
        .option("orderBy", {
          type: "string",
          default: "ASC",
        }),
    (args) => {
      const result = getDocuments(
        args.startFrom,
        args.count,
        { name: args.filterName },
        args.orderBy as OrderByEnum
      );
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "document add_property",
    "Add a property to a document",
    (yargs) =>
      yargs
        .option("documentId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true })
        .option("value", { type: "string", demandOption: true }),
    (args) => {
      addDocumentProperty(args.documentId, args.name, args.value);
    }
  )
  .command(
    "document remove_property",
    "Remove a property from a document",
    (yargs) =>
      yargs
        .option("documentId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true }),
    (args) => {
      removeDocumentProperty(args.documentId, args.name);
    }
  )
  .command(
    "document get_property",
    "Get a property from a document",
    (yargs) =>
      yargs
        .option("documentId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true }),
    (args) => {
      const result = getDocumentProperty(args.documentId, args.name);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "document get_properties",
    "Get properties from a document",
    (yargs) =>
      yargs.option("documentId", { type: "number", demandOption: true }),
    (args) => {
      const result = getDocumentProperties(args.documentId);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  // Document Group commands
  .command(
    "document_group create",
    "Create a document group",
    (yargs) =>
      yargs
        .option("name", { type: "string", demandOption: true })
        .option("description", { type: "string" }),
    (args) => {
      const result = createDocumentGroup(args.name, args.description ?? "");
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "document_group delete",
    "Delete a document group",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      deleteDocumentGroup(args.id);
    }
  )
  .command(
    "document_group get",
    "Get a document group",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      const result = getDocumentGroup(args.id);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "document_group get_all",
    "Get all document groups",
    (yargs) =>
      yargs
        .option("startFrom", { type: "number", default: 0 })
        .option("count", { type: "number", default: 10 })
        .option("filterName", { type: "string" })
        .option("orderBy", {
          type: "string",
          default: "ASC",
        }),
    (args) => {
      const result = getDocumentGroups(
        args.startFrom,
        args.count,
        { name: args.filterName },
        args.orderBy as OrderByEnum
      );
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "document_group add_property",
    "Add a property to a document group",
    (yargs) =>
      yargs
        .option("documentGroupId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true })
        .option("value", { type: "string", demandOption: true }),
    (args) => {
      addDocumentGroupProperty(args.documentGroupId, args.name, args.value);
    }
  )
  .command(
    "document_group remove_property",
    "Remove a property from a document group",
    (yargs) =>
      yargs
        .option("documentGroupId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true }),
    (args) => {
      removeDocumentGroupProperty(args.documentGroupId, args.name);
    }
  )
  .command(
    "document_group get_property",
    "Get a property from a document group",
    (yargs) =>
      yargs
        .option("documentGroupId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true }),
    (args) => {
      const result = getDocumentGroupProperty(args.documentGroupId, args.name);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "document_group add_document",
    "Add a document to a document group",
    (yargs) =>
      yargs
        .option("documentGroupId", { type: "number", demandOption: true })
        .option("documentId", { type: "number", demandOption: true }),
    (args) => {
      addDocumentToGroup(args.documentGroupId, args.documentId);
    }
  )
  // Extraction commands
  .command(
    "extraction create",
    "Create an extraction",
    (yargs) =>
      yargs
        .option("documentGroupId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true })
        .option("status", {
          type: "string",
          demandOption: true,
        }),
    (args) => {
      const result = createExtraction(
        args.documentGroupId,
        args.name,
        args.status as TaskStatusEnum
      );
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "extraction delete",
    "Delete an extraction",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      deleteExtraction(args.id);
    }
  )
  .command(
    "extraction get",
    "Get an extraction",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      const result = getExtraction(args.id);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "extraction get_all",
    "Get all extractions",
    (yargs) =>
      yargs.option("documentGroupId", { type: "number", demandOption: true }),
    (args) => {
      const result = getExtractions(args.documentGroupId);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "extraction add_property",
    "Add a property to an extraction",
    (yargs) =>
      yargs
        .option("extractionId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true })
        .option("value", { type: "string", demandOption: true }),
    (args) => {
      addExtractionProperty(args.extractionId, args.name, args.value);
    }
  )
  .command(
    "extraction remove_property",
    "Remove a property from an extraction",
    (yargs) =>
      yargs
        .option("extractionId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true }),
    (args) => {
      removeExtractionProperty(args.extractionId, args.name);
    }
  )
  .command(
    "extraction get_property",
    "Get a property from an extraction",
    (yargs) =>
      yargs
        .option("extractionId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true }),
    (args) => {
      const result = getExtractionProperty(args.extractionId, args.name);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  // Extracted Field commands
  .command(
    "extracted_field create",
    "Create an extracted field",
    (yargs) =>
      yargs
        .option("extractionId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true })
        .option("value", { type: "string", demandOption: true })
        .option("strategy", { type: "string", demandOption: true })
        .option("status", {
          type: "string",
          demandOption: true,
        }),
    (args) => {
      const result = createExtractedField(
        args.extractionId,
        args.name,
        args.value,
        args.strategy,
        args.status as TaskStatusEnum
      );
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "extracted_field delete",
    "Delete an extracted field",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      deleteExtractedField(args.id);
    }
  )
  .command(
    "extracted_field get",
    "Get an extracted field",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      const result = getExtractedField(args.id);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "extracted_field get_all",
    "Get all extracted fields",
    (yargs) =>
      yargs.option("extractionId", { type: "number", demandOption: true }),
    (args) => {
      const result = getExtractedFields(args.extractionId);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "extracted_field get_by_name",
    "Get an extracted field by name",
    (yargs) =>
      yargs
        .option("extractionId", { type: "number", demandOption: true })
        .option("name", { type: "string", demandOption: true }),
    (args) => {
      const result = getExtractedFieldByName(args.extractionId, args.name);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  // Extracted Field Error commands
  .command(
    "extracted_field_error create",
    "Create an extracted field error",
    (yargs) =>
      yargs
        .option("extractionId", { type: "number", demandOption: true })
        .option("extractedFieldId", { type: "number", demandOption: true })
        .option("message", { type: "string", demandOption: true })
        .option("data", { type: "string", demandOption: true }),
    (args) => {
      const result = createExtractedFieldError(
        args.extractionId,
        args.extractedFieldId,
        args.message,
        args.data
      );
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "extracted_field_error delete",
    "Delete an extracted field error",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      deleteExtractedFieldError(args.id);
    }
  )
  .command(
    "extracted_field_error get",
    "Get an extracted field error",
    (yargs) => yargs.option("id", { type: "number", demandOption: true }),
    (args) => {
      const result = getExtractedFieldError(args.id);
      if (args.printOutput) {
        log(result);
      }
    }
  )
  .command(
    "extracted_field_error get_all",
    "Get all extracted field errors",
    (yargs) =>
      yargs
        .option("extractionId", { type: "number", demandOption: true })
        .option("extractedFieldId", { type: "number" }),
    (args) => {
      const result = getExtractedFieldErrors(
        args.extractionId,
        args.extractedFieldId
      );
      if (args.printOutput) {
        log(result);
      }
    }
  )
  // Extract commands
  .command(
    "extract field",
    "Extract a field",
    (yargs) =>
      yargs
        .option("extractionId", { type: "number", demandOption: true })
        .option("strategy", { type: "string", demandOption: true })
        .option("args", { type: "array" }),
    (args) => {
      const userArgs = Object.fromEntries(
        args.args.map((arg: string) => arg.split("="))
      );
      applyStrategy(args.extractionId, args.strategy, userArgs);
    }
  )
  .demandCommand()
  .help().argv;
