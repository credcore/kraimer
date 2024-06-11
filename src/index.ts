import { config } from "dotenv";
import { checkEnv } from "./env.js";

config();
checkEnv();

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
import { OrderByEnum } from "./domain/OrderByEnum.js";
import { removeDocumentGroupProperty } from "./domain/removeDocumentGroupProperty.js";
import { removeDocumentProperty } from "./domain/removeDocumentProperty.js";
import { removeExtractionProperty } from "./domain/removeExtractionProperty.js";
import { TaskStatusEnum } from "./domain/TaskStatusEnum.js";
import { log } from "./logger/log.js";
import { globalSettings } from "./settings.js";
import { APP_VERSION } from "./settings/version.js";
import { applyStrategy } from "./strategy/applyStrategy.js";

function start() {
  const argv = yargs(hideBin(process.argv))
    .command("version", "Show version information")
    .command("document", "Document commands", (yargs) => {
      yargs
        .command("create", "Create a new document", {
          name: { type: "string", demandOption: true },
          description: { type: "string" },
          type: { type: "string", demandOption: true },
          "file-path": { type: "string", demandOption: true },
        })
        .command("delete", "Delete a document", {
          id: { type: "string", demandOption: true },
        })
        .command("get", "Get a document", {
          id: { type: "string", demandOption: true },
        })
        .command("get-all", "Get all documents", {
          "start-from": { type: "number", default: 0 },
          count: { type: "number", default: 10 },
          "filter-name": { type: "string" },
          "order-by": { type: "string", default: OrderByEnum.ASC },
        })
        .command("add-property", "Add a property to a document", {
          "document-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
          value: { type: "string", demandOption: true },
        })
        .command("remove-property", "Remove a property from a document", {
          "document-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
        })
        .command("get-property", "Get a property of a document", {
          "document-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
        })
        .command("get-properties", "Get all properties of a document", {
          "document-id": { type: "string", demandOption: true },
        })
        .demandCommand(1, "You need to specify a document command");
    })
    .command("document-group", "Document group commands", (yargs) => {
      yargs
        .command("create", "Create a new document group", {
          name: { type: "string", demandOption: true },
          description: { type: "string" },
        })
        .command("delete", "Delete a document group", {
          id: { type: "string", demandOption: true },
        })
        .command("get", "Get a document group", {
          id: { type: "string", demandOption: true },
        })
        .command("get-all", "Get all document groups", {
          "start-from": { type: "number", default: 0 },
          count: { type: "number", default: 10 },
          "filter-name": { type: "string" },
          "order-by": { type: "string", default: OrderByEnum.ASC },
        })
        .command("add-property", "Add a property to a document group", {
          "document-group-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
          value: { type: "string", demandOption: true },
        })
        .command("remove-property", "Remove a property from a document group", {
          "document-group-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
        })
        .command("get-property", "Get a property of a document group", {
          "document-group-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
        })
        .command("add-document", "Add a document to a document group", {
          "document-group-id": { type: "string", demandOption: true },
          "document-id": { type: "string", demandOption: true },
        })
        .demandCommand(1, "You need to specify a document group command");
    })
    .command("extraction", "Extraction commands", (yargs) => {
      yargs
        .command("create", "Create a new extraction", {
          "document-group-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
          status: { type: "string", demandOption: true },
        })
        .command("delete", "Delete an extraction", {
          id: { type: "string", demandOption: true },
        })
        .command("get", "Get an extraction", {
          id: { type: "string", demandOption: true },
        })
        .command("add-property", "Add a property to an extraction", {
          "extraction-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
          value: { type: "string", demandOption: true },
        })
        .command("remove-property", "Remove a property from an extraction", {
          "extraction-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
        })
        .command("get-property", "Get a property of an extraction", {
          "extraction-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
        })
        .command("get-all", "Get all extractions", {
          "document-group-id": { type: "string", demandOption: true },
        })
        .demandCommand(1, "You need to specify an extraction command");
    })
    .command("extracted-field", "Extracted field commands", (yargs) => {
      yargs
        .command("create", "Create a new extracted field", {
          "extraction-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
          value: { type: "string", demandOption: true },
          strategy: { type: "string", demandOption: true },
          status: { type: "string", demandOption: true },
        })
        .command("delete", "Delete an extracted field", {
          id: { type: "string", demandOption: true },
        })
        .command("get", "Get an extracted field", {
          id: { type: "string", demandOption: true },
        })
        .command("get-by-name", "Get an extracted field by name", {
          "extraction-id": { type: "string", demandOption: true },
          name: { type: "string", demandOption: true },
        })
        .command("get-all", "Get all extracted fields", {
          "extraction-id": { type: "string", demandOption: true },
        })
        .demandCommand(1, "You need to specify an extracted field command");
    })
    .command(
      "extracted-field-error",
      "Extracted field error commands",
      (yargs) => {
        yargs
          .command("create", "Create a new extracted field error", {
            "extracted-field-id": { type: "string", demandOption: true },
            message: { type: "string", demandOption: true },
            data: { type: "string", demandOption: true },
          })
          .command("delete", "Delete an extracted field error", {
            id: { type: "number", demandOption: true },
          })
          .command("get", "Get an extracted field error", {
            id: { type: "number", demandOption: true },
          })
          .command("get-all", "Get all extracted field errors", {
            "extraction-id": { type: "string", demandOption: true },
            "extracted-field-id": { type: "string" },
          })
          .demandCommand(
            1,
            "You need to specify an extracted field error command"
          );
      }
    )
    .command("extract", "Extract commands", (yargs) => {
      yargs
        .command("field", "Extract a field", {
          "extraction-id": { type: "string", demandOption: true },
          strategy: { type: "string", demandOption: true },
          args: { type: "array" },
        })
        .demandCommand(1, "You need to specify an extract command");
    })
    .option("llm", { type: "string" })
    .option("model", { type: "string" })
    .option("max-cost-per-session", { type: "number" })
    .option("rpc-timeout", { type: "number" })
    .option("rpc-retries", { type: "number" })
    .option("disable-rpc", { type: "boolean" })
    .option("debug", { type: "boolean" })
    .option("disable-llm-cache", { type: "boolean" })
    .option("search-llm-cache", { type: "boolean" })
    .option("update-llm-cache", { type: "boolean" })
    .option("async-task-id", { type: "string" })
    .option("print-output", { type: "boolean" })
    .option("ignore-llm-cache-entry", { type: "array", string: true })
    .option("args-pdf-start-page", { type: "number" })
    .option("args-pdf-end-page", { type: "number" })
    .option("args-pdf-x-tolerance", { type: "number" })
    .option("args-pdf-y-tolerance", { type: "number" })
    .option("args-pdf-y-density", { type: "number" })
    .option("args-pdf-line-height", { type: "number" })
    .option("args-pdf-char-width", { type: "number" })
    .help()
    .parseSync();

  // LLM
  globalSettings.set("model", argv.model ?? process.env.KRAIMER_LLM_MODEL);

  globalSettings.set(
    "llm",
    argv.llm ?? process.env.KRAIMER_LLM ?? "azure_openai"
  );

  globalSettings.set(
    "maxCostPerSession",
    argv["max-cost-per-session"] ??
      parseInt(process.env.KRAIMER_LLM_MAX_COST_PER_SESSION ?? "50", 10)
  );

  // rpc
  globalSettings.set(
    "rpcTimeout",
    argv["rpc-timeout"] ??
      parseInt(process.env.KRAIMER_RPC_TIMEOUT ?? "300", 10)
  );

  globalSettings.set(
    "rpcRetries",
    argv["rpc-retries"] ?? parseInt(process.env.KRAIMER_RPC_RETRIES ?? "3", 10)
  );

  // start_page and end_page
  if (argv["args-pdf-start-page"]) {
    globalSettings.set("argsPdfStartPage", argv["args-pdf-start-page"]);
  }

  if (argv["args-pdf-end-page"]) {
    globalSettings.set("argsPdfEndPage", argv["args-pdf-end-page"]);
  }

  // tolerance
  if (argv["args-pdf-x-tolerance"]) {
    globalSettings.set("argsPdfXTolerance", argv["args-pdf-x-tolerance"]);
  }

  if (argv["args-pdf-y-tolerance"]) {
    globalSettings.set("argsPdfYTolerance", argv["args-pdf-y-tolerance"]);
  }

  // y density
  if (argv["args-pdf-y-density"]) {
    globalSettings.set("argsPdfYDensity", argv["args-pdf-y-density"]);
  }

  // line height
  if (argv["args-pdf-line-height"]) {
    globalSettings.set("argsPdfLineHeight", argv["args-pdf-line-height"]);
  }

  // char width
  if (argv["args-pdf-char-width"]) {
    globalSettings.set("argsPdfCharWidth", argv["args-pdf-char-width"]);
  }

  // debug
  if (argv.debug) {
    globalSettings.set("debug", true);
  }

  // task id
  if (argv["async-task-id"]) {
    globalSettings.set("asyncTaskId", argv["async-task-id"]);
  }

  // rpc enable/disable
  if (argv["disable-rpc"]) {
    globalSettings.set("disableRpc", true);
  }

  // llm caching
  if (argv["disable-llm-cache"]) {
    globalSettings.set("searchLlmCache", false);
    globalSettings.set("updateLlmCache", false);
  } else {
    globalSettings.set("searchLlmCache", true);
    globalSettings.set("updateLlmCache", true);
  }
  if (argv["search-llm-cache"]) {
    globalSettings.set("searchLlmCache", true);
  }
  if (argv["update-llm-cache"]) {
    globalSettings.set("updateLlmCache", true);
  }

  globalSettings.set(
    "ignoreLlmCacheEntry",
    argv["ignore-llm-cache-entry"] || []
  );

  if (argv._.includes("version")) {
    log(APP_VERSION);
  }

  if (argv._.includes("document")) {
    if (argv.document === "create") {
      const result = createDocument(
        argv.name,
        argv.description,
        argv.type,
        argv["file-path"]
      );
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv.document === "delete") {
      deleteDocument(argv.id);
    } else if (argv.document === "get") {
      const result = getDocument(argv.id);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv.document === "get-all") {
      const documentFilter: DocumentFilter = { name: argv["filter-name"] };
      const result = getDocuments(
        argv["start-from"],
        argv.count,
        documentFilter,
        argv["order-by"] as OrderByEnum
      );
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv.document === "add-property") {
      addDocumentProperty(argv["document-id"], argv.name, argv.value);
    } else if (argv.document === "remove-property") {
      removeDocumentProperty(argv["document-id"], argv.name);
    } else if (argv.document === "get-property") {
      const result = getDocumentProperty(argv["document-id"], argv.name);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv.document === "get-properties") {
      const result = getDocumentProperties(argv["document-id"]);
      if (argv["print-output"]) {
        log(result);
      }
    }
  } else if (argv._.includes("document-group")) {
    if (argv["document-group"] === "create") {
      const result = createDocumentGroup(argv.name, argv.description);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["document-group"] === "delete") {
      deleteDocumentGroup(argv.id);
    } else if (argv["document-group"] === "get") {
      const result = getDocumentGroup(argv.id);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["document-group"] === "get-all") {
      const documentGroupFilter: DocumentGroupFilter = {
        name: argv["filter-name"],
      };
      const result = getDocumentGroups(
        argv["start-from"],
        argv.count,
        documentGroupFilter,
        argv["order-by"] as OrderByEnum
      );
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["document-group"] === "add-property") {
      addDocumentGroupProperty(
        argv["document-group-id"],
        argv.name,
        argv.value
      );
    } else if (argv["document-group"] === "remove-property") {
      removeDocumentGroupProperty(argv["document-group-id"], argv.name);
    } else if (argv["document-group"] === "get-property") {
      const result = getDocumentGroupProperty(
        argv["document-group-id"],
        argv.name
      );
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["document-group"] === "add-document") {
      addDocumentToGroup(argv["document-group-id"], argv["document-id"]);
    }
  } else if (argv._.includes("extraction")) {
    if (argv.extraction === "create") {
      const result = createExtraction(
        argv["document-group-id"],
        argv.name,
        argv.status as TaskStatusEnum
      );
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv.extraction === "delete") {
      deleteExtraction(argv.id);
    } else if (argv.extraction === "get") {
      const result = getExtraction(argv.id);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv.extraction === "add-property") {
      addExtractionProperty(argv["extraction-id"], argv.name, argv.value);
    } else if (argv.extraction === "remove-property") {
      removeExtractionProperty(argv["extraction-id"], argv.name);
    } else if (argv.extraction === "get-property") {
      const result = getExtractionProperty(argv["extraction-id"], argv.name);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv.extraction === "get-all") {
      const result = getExtractions(argv["document-group-id"]);
      if (argv["print-output"]) {
        log(result);
      }
    }
  } else if (argv._.includes("extracted-field")) {
    if (argv["extracted-field"] === "create") {
      const result = createExtractedField(
        argv["extraction-id"],
        argv.name,
        argv.value,
        argv.strategy,
        argv.status as TaskStatusEnum
      );
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["extracted-field"] === "delete") {
      deleteExtractedField(argv.id);
    } else if (argv["extracted-field"] === "get") {
      const result = getExtractedField(argv.id);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["extracted-field"] === "get-all") {
      const result = getExtractedFields(argv["extraction-id"]);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["extracted-field"] === "get-by-name") {
      const result = getExtractedFieldByName(argv["extraction-id"], argv.name);
      if (argv["print-output"]) {
        log(result);
      }
    }
  } else if (argv._.includes("extracted-field-error")) {
    if (argv["extracted-field-error"] === "create") {
      const result = createExtractedFieldError(
        argv["extracted-field-id"],
        argv.message,
        argv.data
      );
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["extracted-field-error"] === "delete") {
      deleteExtractedFieldError(argv.id);
    } else if (argv["extracted-field-error"] === "get") {
      const result = getExtractedFieldError(argv.id);
      if (argv["print-output"]) {
        log(result);
      }
    } else if (argv["extracted-field-error"] === "get-all") {
      const result = getExtractedFieldErrors(
        argv["extraction-id"],
        argv["extracted-field-id"]
      );
      if (argv["print-output"]) {
        log(result);
      }
    }
  } else if (argv._.includes("extract")) {
    if (argv.extract === "field") {
      const userArgs: Record<string, string> =
        argv.args?.reduce((acc, arg) => {
          const [key, value] = arg.split("=");
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>) ?? {};

      applyStrategy(argv["extraction-id"], argv.strategy, userArgs);
    }
  }
}
