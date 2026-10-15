export type DocumentType = {
  id: number;
  name: string;
};

export type DocumentCategory = {
  id: number;
  name: string;
  documentTypes: DocumentType[];
};

export type TaxDocument = {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  taxCaseId: number;
  documentTypeId: number | null;
  documentType: string | null;
  documentCategory: string | null;
};
