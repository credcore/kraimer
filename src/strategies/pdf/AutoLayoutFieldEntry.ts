type BoundingBox = [number, number, number, number];

type PageData = {
  pageNumber: number;
  text: string | null;
  textLayout: string | null;
  tables: {
    table: string[][];
    bbox: BoundingBox;
  }[];
};

type DocumentStructure = {
  pages: PageData[];
};

export type AutoLayoutFieldEntry = {
  id: number;
  name: string;
  content: DocumentStructure;
};
