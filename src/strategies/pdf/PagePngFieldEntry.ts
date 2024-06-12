import { FileContent } from "../../domain/types.js";

export type PagePngFieldEntry = {
  id: number;
  name: string;
  content: {
    files: FileContent[];
  };
};
