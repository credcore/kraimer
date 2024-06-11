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
import { getDocumentGroups } from "./domain/getDocumentGroups.js";
import { getDocumentProperties } from "./domain/getDocumentProperties.js";
import { getDocumentProperty } from "./domain/getDocumentProperty.js";
import { getDocuments } from "./domain/getDocuments.js";
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
import { OrderByEnum, TaskStatusEnum } from "./domain/types.js";
import { log } from "./logger/log.js";
import { applyStrategy } from "./strategy/applyStrategy.js";

async function start() {
  const argv = yargs(hideBin(process.argv))
    .command("document <subcommand>", "Manage documents", (yargs) => {
      yargs
        .command(
          "create",
          "Create a document",
          (yargs) =>
            yargs
              .option("name", { type: "string", demandOption: true })
              .option("description", { type: "string" })
              .option("type", { type: "string", demandOption: true })
              .option("filePath", { type: "string", demandOption: true }),
          async (args) => {
            const result = await createDocument(
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
          "delete",
          "Delete a document",
          (yargs) => yargs.option("id", { type: "number", demandOption: true }),
          async (args) => {
            await deleteDocument(args.id);
          }
        )
        .command(
          "get",
          "Get a document",
          (yargs) => yargs.option("id", { type: "number", demandOption: true }),
          async (args) => {
            const result = await getDocument(args.id);
            if (args.printOutput) {
              log(result);
            }
          }
        )
        .command(
          "get_all",
          "Get all documents",
          (yargs) =>
            yargs
              .option("startFrom", { type: "number", default: 0 })
              .option("count", { type: "number", default: 10 })
              .option("filterName", { type: "string" })
              .option("orderBy", { type: "string", default: "ASC" }),
          async (args) => {
            const result = await getDocuments(
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
          "add_property",
          "Add a property to a document",
          (yargs) =>
            yargs
              .option("documentId", { type: "number", demandOption: true })
              .option("name", { type: "string", demandOption: true })
              .option("value", { type: "string", demandOption: true }),
          async (args) => {
            await addDocumentProperty(args.documentId, args.name, args.value);
          }
        )
        .command(
          "remove_property",
          "Remove a property from a document",
          (yargs) =>
            yargs
              .option("documentId", { type: "number", demandOption: true })
              .option("name", { type: "string", demandOption: true }),
          async (args) => {
            await removeDocumentProperty(args.documentId, args.name);
          }
        )
        .command(
          "get_property",
          "Get a property from a document",
          (yargs) =>
            yargs
              .option("documentId", { type: "number", demandOption: true })
              .option("name", { type: "string", demandOption: true }),
          async (args) => {
            const result = await getDocumentProperty(
              args.documentId,
              args.name
            );
            if (args.printOutput) {
              log(result);
            }
          }
        )
        .command(
          "get_properties",
          "Get properties from a document",
          (yargs) =>
            yargs.option("documentId", { type: "number", demandOption: true }),
          async (args) => {
            const result = await getDocumentProperties(args.documentId);
            if (args.printOutput) {
              log(result);
            }
          }
        )
        .demandCommand(1, "Please specify a document subcommand");
    })
    .command(
      "document_group <subcommand>",
      "Manage document groups",
      (yargs) => {
        yargs
          .command(
            "create",
            "Create a document group",
            (yargs) =>
              yargs
                .option("name", { type: "string", demandOption: true })
                .option("description", { type: "string" }),
            async (args) => {
              const result = await createDocumentGroup(
                args.name,
                args.description ?? ""
              );
              if (args.printOutput) {
                log(result);
              }
            }
          )
          .command(
            "delete",
            "Delete a document group",
            (yargs) =>
              yargs.option("id", { type: "number", demandOption: true }),
            async (args) => {
              await deleteDocumentGroup(args.id);
            }
          )
          .command(
            "get",
            "Get a document group",
            (yargs) =>
              yargs.option("id", { type: "number", demandOption: true }),
            async (args) => {
              const result = await getDocumentGroup(args.id);
              if (args.printOutput) {
                log(result);
              }
            }
          )
          .command(
            "get_all",
            "Get all document groups",
            (yargs) =>
              yargs
                .option("startFrom", { type: "number", default: 0 })
                .option("count", { type: "number", default: 10 })
                .option("filterName", { type: "string" })
                .option("orderBy", { type: "string", default: "ASC" }),
            async (args) => {
              const result = await getDocumentGroups(
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
            "add_property",
            "Add a property to a document group",
            (yargs) =>
              yargs
                .option("documentGroupId", {
                  type: "number",
                  demandOption: true,
                })
                .option("name", { type: "string", demandOption: true })
                .option("value", { type: "string", demandOption: true }),
            async (args) => {
              await addDocumentGroupProperty(
                args.documentGroupId,
                args.name,
                args.value
              );
            }
          )
          .command(
            "remove_property",
            "Remove a property from a document group",
            (yargs) =>
              yargs
                .option("documentGroupId", {
                  type: "number",
                  demandOption: true,
                })
                .option("name", { type: "string", demandOption: true }),
            async (args) => {
              await removeDocumentGroupProperty(
                args.documentGroupId,
                args.name
              );
            }
          )
          .command(
            "get_property",
            "Get a property from a document group",
            (yargs) =>
              yargs
                .option("documentGroupId", {
                  type: "number",
                  demandOption: true,
                })
                .option("name", { type: "string", demandOption: true }),
            async (args) => {
              const result = await getDocumentGroupProperty(
                args.documentGroupId,
                args.name
              );
              if (args.printOutput) {
                log(result);
              }
            }
          )
          .command(
            "add_document",
            "Add a document to a document group",
            (yargs) =>
              yargs
                .option("documentGroupId", {
                  type: "number",
                  demandOption: true,
                })
                .option("documentId", { type: "number", demandOption: true }),
            async (args) => {
              await addDocumentToGroup(args.documentGroupId, args.documentId);
            }
          )
          .demandCommand(1, "Please specify a document_group subcommand");
      }
    )
    .command("extraction <subcommand>", "Manage extractions", (yargs) => {
      yargs
        .command(
          "create",
          "Create an extraction",
          (yargs) =>
            yargs
              .option("documentGroupId", { type: "number", demandOption: true })
              .option("name", { type: "string", demandOption: true })
              .option("status", { type: "string", demandOption: true }),
          async (args) => {
            const result = await createExtraction(
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
          "delete",
          "Delete an extraction",
          (yargs) => yargs.option("id", { type: "number", demandOption: true }),
          async (args) => {
            await deleteExtraction(args.id);
          }
        )
        .command(
          "get",
          "Get an extraction",
          (yargs) => yargs.option("id", { type: "number", demandOption: true }),
          async (args) => {
            const result = await getExtraction(args.id);
            if (args.printOutput) {
              log(result);
            }
          }
        )
        .command(
          "get_all",
          "Get all extractions",
          (yargs) =>
            yargs.option("documentGroupId", {
              type: "number",
              demandOption: true,
            }),
          async (args) => {
            const result = await getExtractions(args.documentGroupId);
            if (args.printOutput) {
              log(result);
            }
          }
        )
        .command(
          "add_property",
          "Add a property to an extraction",
          (yargs) =>
            yargs
              .option("extractionId", { type: "number", demandOption: true })
              .option("name", { type: "string", demandOption: true })
              .option("value", { type: "string", demandOption: true }),
          async (args) => {
            await addExtractionProperty(
              args.extractionId,
              args.name,
              args.value
            );
          }
        )
        .command(
          "remove_property",
          "Remove a property from an extraction",
          (yargs) =>
            yargs
              .option("extractionId", { type: "number", demandOption: true })
              .option("name", { type: "string", demandOption: true }),
          async (args) => {
            await removeExtractionProperty(args.extractionId, args.name);
          }
        )
        .command(
          "get_property",
          "Get a property from an extraction",
          (yargs) =>
            yargs
              .option("extractionId", { type: "number", demandOption: true })
              .option("name", { type: "string", demandOption: true }),
          async (args) => {
            const result = await getExtractionProperty(
              args.extractionId,
              args.name
            );
            if (args.printOutput) {
              log(result);
            }
          }
        )
        .demandCommand(1, "Please specify an extraction subcommand");
    })
    .command(
      "extracted_field <subcommand>",
      "Manage extracted fields",
      (yargs) => {
        yargs
          .command(
            "create",
            "Create an extracted field",
            (yargs) =>
              yargs
                .option("extractionId", { type: "number", demandOption: true })
                .option("name", { type: "string", demandOption: true })
                .option("value", { type: "string", demandOption: true })
                .option("strategy", { type: "string", demandOption: true })
                .option("status", { type: "string", demandOption: true }),
            async (args) => {
              const result = await createExtractedField(
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
            "delete",
            "Delete an extracted field",
            (yargs) =>
              yargs.option("id", { type: "number", demandOption: true }),
            async (args) => {
              await deleteExtractedField(args.id);
            }
          )
          .command(
            "get",
            "Get an extracted field",
            (yargs) =>
              yargs.option("id", { type: "number", demandOption: true }),
            async (args) => {
              const result = await getExtractedField(args.id);
              if (args.printOutput) {
                log(result);
              }
            }
          )
          .command(
            "get_all",
            "Get all extracted fields",
            (yargs) =>
              yargs.option("extractionId", {
                type: "number",
                demandOption: true,
              }),
            async (args) => {
              const result = await getExtractedFields(args.extractionId);
              if (args.printOutput) {
                log(result);
              }
            }
          )
          .command(
            "get_by_name",
            "Get an extracted field by name",
            (yargs) =>
              yargs
                .option("extractionId", { type: "number", demandOption: true })
                .option("name", { type: "string", demandOption: true }),
            async (args) => {
              const result = await getExtractedFieldByName(
                args.extractionId,
                args.name
              );
              if (args.printOutput) {
                log(result);
              }
            }
          )
          .demandCommand(1, "Please specify an extracted_field subcommand");
      }
    )
    .command(
      "extracted_field_error <subcommand>",
      "Manage extracted field errors",
      (yargs) => {
        yargs
          .command(
            "create",
            "Create an extracted field error",
            (yargs) =>
              yargs
                .option("extractionId", { type: "number", demandOption: true })
                .option("extractedFieldId", {
                  type: "number",
                  demandOption: true,
                })
                .option("message", { type: "string", demandOption: true })
                .option("data", { type: "string", demandOption: true }),
            async (args) => {
              const result = await createExtractedFieldError(
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
            "delete",
            "Delete an extracted field error",
            (yargs) =>
              yargs.option("id", { type: "number", demandOption: true }),
            async (args) => {
              await deleteExtractedFieldError(args.id);
            }
          )
          .command(
            "get",
            "Get an extracted field error",
            (yargs) =>
              yargs.option("id", { type: "number", demandOption: true }),
            async (args) => {
              const result = await getExtractedFieldError(args.id);
              if (args.printOutput) {
                log(result);
              }
            }
          )
          .command(
            "get_all",
            "Get all extracted field errors",
            (yargs) =>
              yargs
                .option("extractionId", { type: "number", demandOption: true })
                .option("extractedFieldId", { type: "number" }),
            async (args) => {
              const result = await getExtractedFieldErrors(
                args.extractionId,
                args.extractedFieldId
              );
              if (args.printOutput) {
                log(result);
              }
            }
          )
          .demandCommand(
            1,
            "Please specify an extracted_field_error subcommand"
          );
      }
    )
    .command("extract <subcommand>", "Perform extraction", (yargs) => {
      yargs
        .command(
          "field",
          "Extract a field",
          (yargs) =>
            yargs
              .option("extractionId", { type: "number", demandOption: true })
              .option("strategy", { type: "string", demandOption: true }),
          async (args) => {
            // Predefined keys
            const predefinedKeys = ["_", "$0", "extractionId", "strategy"];

            // Extract user-defined arguments
            const userArgs = Object.keys(args).reduce((obj, key) => {
              if (!predefinedKeys.includes(key)) {
                obj[key] = args[key];
              }
              return obj;
            }, {} as Record<string, unknown>);

            await applyStrategy(args.extractionId, args.strategy, userArgs);
          }
        )
        .demandCommand(1, "Please specify an extract subcommand");
    })
    .demandCommand()
    .help().argv;
}

start();
