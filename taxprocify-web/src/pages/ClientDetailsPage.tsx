import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import TaxCaseStatusBadge from "../components/TaxCaseStatusBadge";
import type { Client } from "../types/client";
import type { TaxCase } from "../types/taxCase";
import {
  getClientById,
  updateClient,
  deleteClient,
  assignPortalUser,
  createPortalAccount,
  unassignPortalUser,
  resetPortalPassword,
} from "../api/clients";
import { getTaxCasesByClient } from "../api/taxCases";

function ClientDetailsPage() {
  // Get the client ID from the URL parameters and set up navigation
  const { id } = useParams();
  const navigate = useNavigate();

  // State variables for client details, tax cases, loading state, and error message
  const [client, setClient] = useState<Client | null>(null);
  const [taxCases, setTaxCases] = useState<TaxCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State variables for editing client details
  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const [portalUserId, setPortalUserId] = useState("");
  const [assigningPortalUser, setAssigningPortalUser] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [portalSuccess, setPortalSuccess] = useState("");

  const [resetPassword, setResetPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [unlinkingPortalUser, setUnlinkingPortalUser] = useState(false);

  const [showPasswordResetSuccess, setShowPasswordResetSuccess] =
    useState(false);

  const [showPortalErrorModal, setShowPortalErrorModal] = useState(false);

  const [portalPassword, setPortalPassword] = useState("");
  const [creatingPortalAccount, setCreatingPortalAccount] = useState(false);

  useEffect(() => {
    async function loadClient() {
      try {
        const data = await getClientById(id!);

        setClient(data);

        const taxCaseData = await getTaxCasesByClient(id!);

        setTaxCases(taxCaseData);
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [id]);

  function startEditingClient() {
    if (!client) {
      return;
    }

    setEditFirstName(client.firstName);
    setEditLastName(client.lastName);
    setEditEmail(client.email);
    setEditPhone(client.phone ?? "");
    setEditError("");
    setEditing(true);
  }

  // Function to handle updating the client details
  async function handleUpdateClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!client) {
      return;
    }

    setEditError("");
    setSaving(true);

    try {
      const updatedClient = await updateClient(client.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone || null,
      });

      setClient(updatedClient);
      setEditing(false);

      setClient(updatedClient);
      setEditing(false);
    } catch (error) {
      console.error(error);
      setEditError("Unable to update client.");
    } finally {
      setSaving(false);
    }
  }

  // Function to handle deleting the client
  async function handleDeleteClient() {
    if (!client) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.firstName} ${client.lastName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteClient(client.id);

      navigate("/clients");
    } catch (error) {
      console.error(error);
      setEditError("Unable to delete client.");
    }
  }

  async function handleAssignPortalUser(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!client) {
      return;
    }

    if (!portalUserId.trim()) {
      setPortalError("Please enter a portal user ID.");
      return;
    }

    setPortalError("");
    setPortalSuccess("");
    setAssigningPortalUser(true);

    try {
      await assignPortalUser(client.id, portalUserId.trim());

      await reloadClient();

      setPortalSuccess("Portal user assigned successfully.");
      setPortalUserId("");
    } catch (error) {
      console.error(error);

      setPortalError(
        error instanceof Error
          ? error.message
          : "Unable to assign portal user.",
      );
    } finally {
      setAssigningPortalUser(false);
    }
  }

  async function handleCreatePortalAccount(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!client) {
      return;
    }

    if (!portalPassword.trim()) {
      setPortalError("Please enter a temporary password.");
      return;
    }

    setPortalError("");
    setPortalSuccess("");
    setCreatingPortalAccount(true);

    try {
      await createPortalAccount(client.id, portalPassword.trim());

      await reloadClient();

      setPortalSuccess(
        `Portal account created successfully for ${client.email}.`,
      );

      setPortalPassword("");
    } catch (error) {
      console.error(error);

      setPortalError(
        error instanceof Error
          ? error.message
          : "Unable to create portal account.",
      );
      setShowPortalErrorModal(true);
    } finally {
      setCreatingPortalAccount(false);
    }
  }

  async function handleUnassignPortalUser() {
    if (!client) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to unlink this portal account?",
    );

    if (!confirmed) {
      return;
    }

    setPortalError("");
    setPortalSuccess("");
    setUnlinkingPortalUser(true);

    try {
      await unassignPortalUser(client.id);

      await reloadClient();

      setPortalSuccess("Portal account unlinked successfully.");
    } catch (error) {
      console.error(error);

      setPortalError(
        error instanceof Error
          ? error.message
          : "Unable to unlink portal account.",
      );
    } finally {
      setUnlinkingPortalUser(false);
    }
  }

  async function handleResetPortalPassword(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!client) {
      return;
    }

    if (!resetPassword.trim()) {
      setPortalError("Please enter a new temporary password.");
      return;
    }

    setPortalError("");
    setPortalSuccess("");
    setResettingPassword(true);

    try {
      await resetPortalPassword(client.id, resetPassword.trim());

      setShowPasswordResetSuccess(true);
      setResetPassword("");
      setShowResetPassword(false);
    } catch (error) {
      console.error(error);

      setPortalError(
        error instanceof Error
          ? error.message
          : "Unable to reset portal password.",
      );
    } finally {
      setResettingPassword(false);
    }
  }

  async function reloadClient() {
    if (!id) {
      return;
    }

    const data = await getClientById(id);
    setClient(data);
  }

  if (loading) {
    return <p className="p-8">Loading client...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/clients")}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Clients
        </button>

        <div className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-gray-900">
            {client.firstName} {client.lastName}
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEditingClient}
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDeleteClient}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
            {editing && (
              <form
                onSubmit={handleUpdateClient}
                className="mt-6 space-y-4 rounded-lg bg-gray-50 p-5"
              >
                {editError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {editError}
                  </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="editFirstName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>

                    <input
                      id="editFirstName"
                      type="text"
                      value={editFirstName}
                      onChange={(event) => setEditFirstName(event.target.value)}
                      required
                      maxLength={50}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="editLastName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>

                    <input
                      id="editLastName"
                      type="text"
                      value={editLastName}
                      onChange={(event) => setEditLastName(event.target.value)}
                      required
                      maxLength={50}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="editEmail"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>

                    <input
                      id="editEmail"
                      type="email"
                      value={editEmail}
                      onChange={(event) => setEditEmail(event.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="editPhone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>

                    <input
                      id="editPhone"
                      type="text"
                      value={editPhone}
                      onChange={(event) => setEditPhone(event.target.value)}
                      maxLength={30}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditError("");
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{client.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{client.phone ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Client ID</p>
              <p className="font-medium text-gray-900">{client.id}</p>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Tax Cases</h2>

            <button
              type="button"
              onClick={() => navigate(`/clients/${client.id}/tax-cases/new`)}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Add Tax Case
            </button>
          </div>

          {taxCases.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">
                No tax cases found for this client.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Tax Year
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Missing Documents
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Progress
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {taxCases.map((taxCase) => (
                    <tr
                      key={taxCase.id}
                      onClick={() => navigate(`/tax-cases/${taxCase.id}`)}
                      className="border-t border-gray-200"
                    >
                      <td className="px-6 py-4">{taxCase.taxYear}</td>

                      <td className="px-6 py-4">
                        <TaxCaseStatusBadge status={taxCase.status} />
                      </td>

                      <td className="px-6 py-4">
                        {taxCase.missingDocumentsCount}
                      </td>

                      <td className="px-6 py-4">
                        {taxCase.documentProgressPercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Portal Account
          </h2>

          {client.portalUserId ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Portal Account Active
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    This client already has a portal login account.
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  Active
                </span>
              </div>

              <div className="mt-5">
                <p className="text-sm text-gray-500">Login Email</p>
                <p className="font-medium text-gray-900">{client.email}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowResetPassword((current) => !current)}
                className="mt-5 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
              >
                Reset Password
              </button>

              <button
                type="button"
                onClick={handleUnassignPortalUser}
                disabled={unlinkingPortalUser}
                className="mt-5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                {unlinkingPortalUser ? "Unlinking..." : "Unlink Portal Account"}
              </button>

              {showResetPassword && (
                <form
                  onSubmit={handleResetPortalPassword}
                  className="mt-4 rounded-lg bg-gray-50 p-4"
                >
                  <label
                    htmlFor="resetPortalPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    New Temporary Password
                  </label>

                  <input
                    id="resetPortalPassword"
                    type="password"
                    value={resetPassword}
                    onChange={(event) => setResetPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      type="submit"
                      disabled={resettingPassword}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {resettingPassword ? "Resetting..." : "Reset Password"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetPassword("");
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <form
                onSubmit={handleCreatePortalAccount}
                className="rounded-xl bg-white p-6 shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Portal Account
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Create a login account for this client.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="portalEmail"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Login Email
                    </label>

                    <input
                      id="portalEmail"
                      type="email"
                      value={client.email}
                      disabled
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="portalPassword"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Temporary Password
                    </label>

                    <input
                      id="portalPassword"
                      type="password"
                      value={portalPassword}
                      onChange={(event) =>
                        setPortalPassword(event.target.value)
                      }
                      placeholder="Enter temporary password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creatingPortalAccount}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingPortalAccount
                    ? "Creating..."
                    : "Create Portal Account"}
                </button>
              </form>

              <form
                onSubmit={handleAssignPortalUser}
                className="rounded-xl bg-white p-6 shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Assign Existing Portal User
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Use this only if a Client-role user account already exists.
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="portalUserId"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Portal User ID
                  </label>

                  <input
                    id="portalUserId"
                    type="text"
                    value={portalUserId}
                    onChange={(event) => setPortalUserId(event.target.value)}
                    placeholder="Enter Client user GUID"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assigningPortalUser}
                  className="mt-4 rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  {assigningPortalUser
                    ? "Assigning..."
                    : "Assign Existing User"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      {showPasswordResetSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900">
              Password Updated
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              The portal password has been changed successfully.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              The client can now log in using the new password.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPasswordResetSuccess(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showPortalErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900">
              Unable to Complete Action
            </h3>

            <p className="mt-3 text-sm text-gray-600">{portalError}</p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowPortalErrorModal(false);
                  setPortalError("");
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDetailsPage;
