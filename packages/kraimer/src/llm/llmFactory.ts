import * as azureOpenAI from "./azureOpenAI/index.js";
import * as openAI from "./openAI/index.js";
import { LLM } from "./types.js";

// Define mapping from names to modules
const nameToModuleMapping: { [key: string]: LLM } = {
  azure_openai: azureOpenAI,
  openai: openAI,
  // 'anthropic': anthropic
  // add more mappings as needed
};

export const llmFactory = (llmName: string): LLM => {
  // Check if the name exists in the mapping
  if (!(llmName in nameToModuleMapping)) {
    throw new Error(`Unsupported llm: ${llmName}`);
  }

  // Fetch the module from the mapping
  return nameToModuleMapping[llmName];
};
