import { apiFetch } from "./apiClient";
import type { Client, PagedClients } from "../types/client";

export async function getClients(
  search: string,
  page: number,
  pageSize: number,
): Promise<PagedClients> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  params.set("page", page.toString());
  params.set("pageSize", pageSize.toString());

  const response = await apiFetch(`/Clients?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load clients.");
  }

  return response.json();
}

export async function getClientById(id: number | string): Promise<Client> {
  const response = await apiFetch(`/Clients/getclient/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load client.");
  }

  return response.json();
}

export type CreateClientRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};

export type UpdateClientRequest = CreateClientRequest;

export async function createClient(
  request: CreateClientRequest,
): Promise<Client> {
  const response = await apiFetch("/Clients/createclient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();

    if (text) {
      try {
        const data = JSON.parse(text);
        throw new Error(data.message ?? "Failed to create client.");
      } catch {
        throw new Error(text);
      }
    }

    throw new Error("Failed to create client.");
  }

  return response.json();
}

export async function updateClient(
  clientId: number | string,
  request: UpdateClientRequest,
): Promise<Client> {
  const response = await apiFetch(`/Clients/updateclient/${clientId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();

    let message = "Failed to update client.";

    if (text) {
      try {
        const data = JSON.parse(text);
        message = data.message ?? text;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.json();
}

export async function deleteClient(clientId: number | string): Promise<void> {
  const response = await apiFetch(`/Clients/deleteclient/${clientId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete client.");
  }
}

export async function assignPortalUser(
  clientId: number | string,
  userId: string,
): Promise<void> {
  const response = await apiFetch(
    `/Clients/${clientId}/portal-user/${userId}`,
    {
      method: "PUT",
    },
  );

  if (response.ok) {
    return;
  }

  let message = "Failed to assign portal user.";

  try {
    const data = await response.json();

    if (data?.message) {
      message = data.message;
    }
  } catch {
    const text = await response.text();

    if (text) {
      message = text;
    }
  }

  throw new Error(message);
}

export async function createPortalAccount(
  clientId: number | string,
  password: string,
): Promise<void> {
  const response = await apiFetch(`/Clients/${clientId}/portal-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password,
    }),
  });

  if (response.ok) {
    return;
  }

  let message = "Failed to create portal account.";

  try {
    const data = await response.json();

    if (data?.message) {
      message = data.message;
    }
  } catch {
    const text = await response.text();

    if (text) {
      message = text;
    }
  }

  throw new Error(message);
}

export async function unassignPortalUser(
  clientId: number | string,
): Promise<void> {
  const response = await apiFetch(`/Clients/${clientId}/portal-user`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to unlink portal user.");
  }
}

export async function resetPortalPassword(
  clientId: number | string,
  password: string,
): Promise<void> {
  const response = await apiFetch(
    `/Clients/${clientId}/portal-account/password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    },
  );

  if (response.ok) {
    return;
  }

  let message = "Failed to reset portal password.";

  try {
    const data = await response.json();

    if (data?.message) {
      message = data.message;
    }
  } catch {
    const text = await response.text();

    if (text) {
      message = text;
    }
  }

  throw new Error(message);
}
