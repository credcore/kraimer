import { Message } from "./types.js";

export function toPrettyPrintableMessages(
  messages: Message[],
  indent = 2
): object {
  const modifiedMessages = messages.map((message) => {
    if (typeof message.content === "string") {
      return message;
    } else {
      const modifiedContent = message.content.map((item) => {
        if (item.type === "image_url") {
          return item.image_url.detail
            ? {
                type: item.type,
                image_url: `[image_url (${item.image_url.detail}-res)]`,
              }
            : { type: item.type, image_url: "[image_url]" };
        } else {
          return item;
        }
      });
      return { ...message, content: modifiedContent };
    }
  });

  return modifiedMessages;
}
