import { globalSettings } from '../settings';
import { extractJson } from './extractJson';
import { llmFactory } from './llmFactory';
import { LLMCompletionResponse } from './llmTypes';
import { debugPrint } from '../logger/debugPrint';
import { applyTemplate } from '../templating/applyTemplate';

export const constructMessage = (
  prompt: string, images?: string[]
): { role: string; content: any }[] => {
  const messageContent: { type: string; text?: string; image_url?: { url: string } }[] = [{ type: 'text', text: prompt }];
  if (images) {
    for (const image of images) {
      messageContent.push({ type: 'image_url', image_url: { url: image } });
    }
  }
  return [{ role: 'user', content: messageContent }];
};

export const llmQuery = async (
  query: string,
  responseType: string = 'json',
  responseJsonSchema?: string,
  llmTemplate: string = 'step_by_step',
  llmName?: string,
  model?: string,
  images?: string[]
): Promise<{ response: LLMCompletionResponse; json?: any; text?: string }> => {
  if (images && !Array.isArray(images)) {
    throw new TypeError('images must be a list or null');
  }

  const inputToLlm = applyTemplate(`llm/${llmTemplate}`, { prompt: query, json_schema: responseJsonSchema });

  debugPrint(inputToLlm, 'Input to LLM');

  if (images) {
    debugPrint(`Number of images: ${images.length}`);
  }

  const messages = constructMessage(query, images);

  if (!llmName) {
    llmName = globalSettings.llm;
  }

  if (!model) {
    model = globalSettings.model;
  }

  const llm = llmFactory(llmName);
  const llmResponse = await llm.invokeCompletion(messages, model);
  const responseValue = responseType === 'json' ? extractJson(llmResponse.response) : llmResponse.response;

  return {
    response: llmResponse,
    ...(responseType === 'json' ? { json: responseValue } : { text: responseValue })
  };
};
