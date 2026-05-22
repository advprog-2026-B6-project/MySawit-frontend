"use client";

import { PageHero, PageShell, SurfaceCard } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestJson } from "@/lib/api-client";
import { getStoredToken, parseRoleFromToken } from "@/lib/auth";
import {
  ArrowLeft,
  Loader2,
  Search,
  Trash2,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const searchTypes = ["Username", "Role"];
const MANDOR_DELETE_BLOCKED_MESSAGE =
  "We cant delete that users as its been assigned to a Buruh";

const roleBadgeStyles = {
  ADMIN: "border-emerald-200 bg-emerald-50 text-emerald-800",
  MANDOR: "border-amber-200 bg-amber-50 text-amber-800",
  BURUH: "border-sky-200 bg-sky-50 text-sky-800",
  SUPIR: "border-violet-200 bg-violet-50 text-violet-800",
};

function ModalFrame({ title, description, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
      <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {description ? (
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("Username");
  const [users, setUsers] = useState([]);
  const [mandors, setMandors] = useState([]);
  const [pageError, setPageError] = useState("");
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isMandorsLoading, setIsMandorsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState(null);
  const [selectedMandor, setSelectedMandor] = useState("");
  const [canRenderAdmin, setCanRenderAdmin] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsUsersLoading(true);
      setPageError("");
      const data = await requestJson("/admin/users", { auth: true });
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setPageError(error.message || "Failed to load users.");
      toast.error(error.message || "Failed to load users.");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const authorizeAdmin = useCallback(() => {
    const token = getStoredToken();
    const role = parseRoleFromToken(token);

    if (role !== "ADMIN") {
      router.replace("/");
      return;
    }

    setCanRenderAdmin(true);
    loadUsers();
  }, [loadUsers, router]);

  const loadMandors = async () => {
    try {
      setIsMandorsLoading(true);
      const data = await requestJson("/admin/users", { auth: true });
      setMandors(
        (Array.isArray(data) ? data : []).filter(
          (user) => user.role === "MANDOR",
        ),
      );
    } catch (error) {
      toast.error(error.message || "Failed to load mandor list.");
    } finally {
      setIsMandorsLoading(false);
    }
  };

  useEffect(() => {
    authorizeAdmin();
  }, [authorizeAdmin]);

  useEffect(() => {
    if (showAssignModal) {
      loadMandors();
    }
  }, [showAssignModal]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (!query) {
        return true;
      }

      if (searchBy === "Role") {
        return (user.role || "").toLowerCase().includes(query);
      }

      return (user.username || "").toLowerCase().includes(query);
    });
  }, [search, searchBy, users]);

  const closeDeleteModal = () => {
    setShowDeleteConfirm(false);
    setSelectedUserForDelete(null);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedUserForAssign(null);
    setSelectedMandor("");
  };

  const handleDeleteClick = (user) => {
    setSelectedUserForDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleAssignClick = (user) => {
    setSelectedUserForAssign(user);
    setSelectedMandor(user.mandorUsername || "");
    setShowAssignModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) {
      return;
    }

    const hasAssignedBuruh = users.some(
      (user) =>
        user.role === "BURUH" &&
        user.mandorUsername === selectedUserForDelete.username,
    );

    if (selectedUserForDelete.role === "MANDOR" && hasAssignedBuruh) {
      toast.error(MANDOR_DELETE_BLOCKED_MESSAGE);
      closeDeleteModal();
      return;
    }

    try {
      setActionLoading(true);
      await requestJson(`/admin/delete/${selectedUserForDelete.id}`, {
        method: "DELETE",
        auth: true,
      });
      toast.success(
        `User ${selectedUserForDelete.username} deleted successfully.`,
      );
      closeDeleteModal();
      await loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedUserForAssign || !selectedMandor) {
      toast.error("Please select a mandor.");
      return;
    }

    const isReassign = Boolean(selectedUserForAssign.mandorUsername);
    const endpoint = isReassign
      ? `/admin/reassign/${selectedUserForAssign.username}/${selectedMandor}`
      : `/admin/assign/${selectedUserForAssign.username}/${selectedMandor}`;

    try {
      setActionLoading(true);
      await requestJson(endpoint, {
        method: "POST",
        auth: true,
      });
      toast.success(
        `User ${selectedUserForAssign.username} has been ${isReassign ? "reassigned" : "assigned"} successfully.`,
      );
      closeAssignModal();
      await loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to assign mandor.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!canRenderAdmin) {
    return null;
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Auth Module"
        title="Admin dashboard"
        description="Manage user records, clean up inactive accounts, and keep buruh to mandor assignments in sync with one consistent admin workflow."
        actions={
          <>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={loadUsers}
              disabled={isUsersLoading}
            >
              {isUsersLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Users className="size-4" />
              )}
              Refresh users
            </Button>
          </>
        }
      />

      <SurfaceCard>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            User Directory
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            List of all users
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Click a row to open the detailed profile view. Use the actions
            column for destructive or assignment flows.
          </p>
          <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Assignment workflow disclaimer: only buruh accounts can be assigned
            or reassigned to a mandor.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px] lg:max-w-[420px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Filter by ${searchBy.toLowerCase()}`}
                className="pl-9"
              />
            </div>
            <Combobox
              items={searchTypes}
              value={searchBy}
              onValueChange={setSearchBy}
            >
              <ComboboxInput placeholder="Search type" />
              <ComboboxContent>
                <ComboboxEmpty>No options found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {pageError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pageError}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-3xl border border-green-100 bg-white">
            <div className="grid grid-cols-12 gap-4 bg-green-50 px-5 py-4 text-sm font-semibold text-green-900">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Username</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Mandor</div>
              <div className="col-span-3">Actions</div>
            </div>

            <div className="max-h-[34rem] overflow-y-auto">
              {isUsersLoading ? (
                <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm text-slate-500">
                  <Loader2 className="size-4 animate-spin" />
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  No users found.
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="grid w-full grid-cols-12 gap-4 border-t border-slate-100 px-5 py-4 transition hover:bg-green-50/60"
                  >
                    <button
                      type="button"
                      className="col-span-9 grid grid-cols-9 gap-4 text-left"
                      onClick={() => router.push(`/profile/${user.id}`)}
                    >
                      <div className="col-span-1 text-sm text-slate-600">
                        {index + 1}
                      </div>
                      <div className="col-span-4 truncate font-medium text-green-800">
                        {user.username}
                      </div>
                      <div className="col-span-2 text-sm">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${roleBadgeStyles[user.role] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm text-slate-600">
                        {user.mandorUsername || "-"}
                      </div>
                    </button>
                    <div className="col-span-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                      {user.role === "BURUH" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAssignClick(user)}
                        >
                          <UserRoundCog className="size-4" />
                          {user.mandorUsername ? "Reassign" : "Assign"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SurfaceCard>

      {showDeleteConfirm && selectedUserForDelete ? (
        <ModalFrame
          title="Confirm delete"
          description={`Delete @${selectedUserForDelete.username} permanently from the system.`}
          onClose={closeDeleteModal}
        >
          <div className="space-y-6">
            <p className="text-sm leading-6 text-slate-600">
              This action cannot be undone. Make sure the account is no longer
              needed before removing it.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} disabled={actionLoading}>
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete user
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {showAssignModal && selectedUserForAssign ? (
        <ModalFrame
          title={
            selectedUserForAssign.mandorUsername
              ? "Reassign mandor"
              : "Assign mandor"
          }
          description={`Choose the mandor responsible for @${selectedUserForAssign.username}.`}
          onClose={closeAssignModal}
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-green-100 bg-green-50/60 p-4 text-sm text-slate-700">
              <p>
                Buruh:{" "}
                <span className="font-semibold">
                  @{selectedUserForAssign.username}
                </span>
              </p>
              <p className="mt-1">
                Current mandor:{" "}
                <span className="font-semibold">
                  {selectedUserForAssign.mandorUsername || "Not assigned"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select mandor</Label>
              <Combobox
                items={mandors.map((mandor) => mandor.username)}
                value={selectedMandor}
                onValueChange={setSelectedMandor}
              >
                <ComboboxInput
                  placeholder={
                    isMandorsLoading ? "Loading mandors..." : "Choose a mandor"
                  }
                />
                <ComboboxContent>
                  <ComboboxEmpty>No mandor found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeAssignModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAssign}
                disabled={actionLoading || isMandorsLoading}
              >
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserRoundCog className="size-4" />
                )}
                {selectedUserForAssign.mandorUsername ? "Reassign" : "Assign"}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}
    </PageShell>
  );
}
