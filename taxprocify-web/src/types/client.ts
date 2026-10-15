export type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  userId: string;
};

export type PagedClients = {
  items: Client[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
