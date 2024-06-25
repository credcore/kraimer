import { FileContent } from "kraimer/dist/domain/types.js";

export type PagePngFieldEntry = {
  id: number;
  name: string;
  content: {
    files: FileContent[];
  };
};
