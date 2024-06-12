export type Image = {
  url: string;
};

export type TextContent = {
  text: string;
};

export type ImageContent = {
  image: Image;
};

export type Content = TextContent | ImageContent;

export type Message = {
  role: string;
  content: string | Content[];
};
