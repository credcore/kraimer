import * as json from 'json';

export const extractJson = (text: string): any | null => {
  const pattern = /```(?:json\s*)?(.*?)\s*```/gs;
  const matches = [...text.matchAll(pattern)].map(match => match[1].trim());

  if (matches.length > 0) {
    try {
      return JSON.parse(matches[matches.length - 1]);
    } catch (e) {
      return null;
    }
  }
  return null;
};
