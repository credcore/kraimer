import { Message } from "./types.js";

export function prettyPrintMessages(messages: Message[], indent = 2): string {
  const modifiedMessages = messages.map((message) => {
    if (typeof message.content === "string") {
      return message;
    } else {
      const modifiedContent = message.content.map((item) => {
        if (item.type === "image_url") {
          return { type: item.type, image_url: "[image_url]" };
        } else {
          return item;
        }
      });
      return { ...message, content: modifiedContent };
    }
  });

  return JSON.stringify(modifiedMessages, null, indent);
}
