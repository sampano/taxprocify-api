export type DocumentType = {
  id: number;
  name: string;
};

export type DocumentCategory = {
  id: number;
  name: string;
  documentTypes: DocumentType[];
};
