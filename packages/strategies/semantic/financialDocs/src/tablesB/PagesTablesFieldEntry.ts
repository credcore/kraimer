export type PageData = {
  pageNumber: number;
  tables: [
    {
      name: string;
      summary: string;
    }
  ];
};

export type PagesTablesFieldEntry = {
  id: number;
  name: string;
  content: {
    pages: Array<PageData>;
  };
};
