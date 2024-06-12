import * as azureOpenai from './azureOpenai';
import { LLM } from './llmTypes';

// Define mapping from names to modules
const nameToModuleMapping: { [key: string]: LLM } = {
  'azure_openai': azureOpenai,
  // 'openai': ...
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