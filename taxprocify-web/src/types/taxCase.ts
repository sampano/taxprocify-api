export type MissingDocument = {
  id: number;
  documentTypeId: number;
  documentType: string;
  documentCategory: string;
  note: string | null;
};

export type RecentDocument = {
  id: number;
  fileName: string;
  documentType: string | null;
  documentCategory: string | null;
  uploadedAt: string;
};

export type TaxCaseSummary = {
  id: number;
  clientId: number;
  taxYear: number;
  status: string;
  requestedDocumentsCount: number;
  completedDocumentsCount: number;
  missingDocumentsCount: number;
  documentProgressPercentage: number;
  missingDocuments: MissingDocument[];
  recentDocuments: RecentDocument[];
};

export type TaxCase = {
  id: number;
  taxYear: number;
  status: string;
  createdAt: string;
  clientId: number;
  requestedDocumentsCount: number;
  completedDocumentsCount: number;
  missingDocumentsCount: number;
  documentProgressPercentage: number;
};
