"use client";

import React, { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  addForumAdmin,
  removeForumAdmin,
  addForumPermission,
  removeForumPermission,
} from "@/lib/actions/forum";
import { useForumAdmin } from "@/hooks/useForum";
import { PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import useDunaCategory from "@/hooks/useDunaCategory";

interface ForumAdmin {
  dao_slug: string;
  address: string;
}

interface ForumPermission {
  id: number;
  dao_slug: string;
  permissionType: string;
  scope: string;
  scopeId: number | null;
  address: string;
}

interface ForumCategory {
  id: number;
  name: string;
  archived: boolean;
}

interface ForumPermissionsManagerProps {
  initialAdmins: ForumAdmin[];
  initialPermissions: ForumPermission[];
  categories: ForumCategory[];
}

const PERMISSION_TYPES = [
  { value: "manage_topics", label: "Manage Topics" },
  { value: "create_topics", label: "Create Topics" },
  { value: "manage_attachments", label: "Manage Attachments" },
  { value: "create_attachments", label: "Create Attachments" },
];

const ForumPermissionsManager = ({
  initialAdmins,
  initialPermissions,
  categories,
}: ForumPermissionsManagerProps) => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [admins, setAdmins] = useState<ForumAdmin[]>(initialAdmins);
  const [permissions, setPermissions] =
    useState<ForumPermission[]>(initialPermissions);
  const [loading, setLoading] = useState(false);

  const [newAdminAddress, setNewAdminAddress] = useState("");

  const [newPermissionAddress, setNewPermissionAddress] = useState("");
  const [newPermissionType, setNewPermissionType] = useState("");
  const [newPermissionScope, setNewPermissionScope] = useState<
    "forum" | "category"
  >("category");
  const [newPermissionScopeId, setNewPermissionScopeId] = useState<
    number | null
  >(null);

  const { dunaCategoryId, isLoading: isDunaLoading } = useDunaCategory();

  const { isAdmin, isLoading } = useForumAdmin(dunaCategoryId || undefined);

  const { ui } = Tenant.current();
  const useDarkStyling = ui.toggle("ui/use-dark-theme-styling")?.enabled;

  // Check if current tenant is Towns
  const { namespace } = Tenant.current();
  const isTowns = namespace === TENANT_NAMESPACES.TOWNS;

  const handleAddAdmin = async () => {
    if (!address || !newAdminAddress.trim()) return;

    setLoading(true);
    try {
      const message = `Add forum admin: ${newAdminAddress.trim()}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });

      const result = await addForumAdmin({
        address: newAdminAddress.trim(),
        adminAddress: address,
        signature,
        message,
      });

      if (result.success) {
        setAdmins([...admins, result.data as ForumAdmin]);
        setNewAdminAddress("");
        toast.success("Admin added successfully!");
      } else {
        toast.error(result.error || "Failed to add admin");
      }
    } catch (error) {
      toast.error("Failed to add admin");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminAddress: string) => {
    if (!address) return;

    setLoading(true);
    try {
      const message = `Remove forum admin: ${adminAddress}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });

      const result = await removeForumAdmin({
        address: adminAddress,
        adminAddress: address,
        signature,
        message,
      });

      if (result.success) {
        setAdmins(admins.filter((admin) => admin.address !== adminAddress));
        toast.success("Admin removed successfully!");
      } else {
        toast.error(result.error || "Failed to remove admin");
      }
    } catch (error) {
      toast.error("Failed to remove admin");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!address || !newPermissionAddress.trim() || !newPermissionType) return;

    setLoading(true);
    try {
      const message = `Add forum permission: ${newPermissionType} for ${newPermissionAddress.trim()}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });

      const result = await addForumPermission({
        address: newPermissionAddress.trim(),
        permissionType: newPermissionType,
        scope: newPermissionScope,
        scopeId: newPermissionScopeId,
        adminAddress: address,
        signature,
        message,
      });

      if (result.success) {
        setPermissions([...permissions, result.data as ForumPermission]);
        setNewPermissionAddress("");
        setNewPermissionType("");
        setNewPermissionScope("forum");
        setNewPermissionScopeId(null);
        toast.success("Permission added successfully!");
      } else {
        toast.error(result.error || "Failed to add permission");
      }
    } catch (error) {
      toast.error("Failed to add permission");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    if (!address) return;

    setLoading(true);
    try {
      const message = `Remove forum permission: ${permissionId}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });

      const result = await removeForumPermission({
        permissionId,
        adminAddress: address,
        signature,
        message,
      });

      if (result.success) {
        setPermissions(permissions.filter((p) => p.id !== permissionId));
        toast.success("Permission removed successfully!");
      } else {
        toast.error(result.error || "Failed to remove permission");
      }
    } catch (error) {
      toast.error("Failed to remove permission");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (id: number | null) => {
    if (!id) return "All Categories";
    const category = categories.find((c) => c.id === id);
    return category?.name || "Unknown Category";
  };

  if (isLoading || isDunaLoading) {
    return <AgoraLoader />;
  }

  if (!address) {
    return (
      <div className="mt-12 text-center">
        <p className="text-tertiary">
          Please connect your wallet to manage forum permissions.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mt-12 text-center">
        <p className="text-tertiary">
          You don&apos;t have permission to manage forum settings.
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-12 space-y-8 ${useDarkStyling ? "towns-tenant" : ""}`}>
      <div className="flex items-center justify-between">
        <h1
          className={`text-2xl font-black ${
            isTowns ? "text-white" : "text-primary"
          }`}
        >
          Permissions Management
        </h1>
      </div>

      {/* Forum Admins Section */}
      <Card className="border shadow-sm bg-cardBackground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-xl font-semibold ${
                isTowns ? "text-white" : "text-primary"
              }`}
            >
              Admins
            </h2>
            <Badge variant="secondary">{admins.length} admins</Badge>
          </div>

          <div className="space-y-4">
            {/* Add new admin */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter wallet address"
                value={newAdminAddress}
                onChange={(e) => setNewAdminAddress(e.target.value)}
                className={`flex-1 ${
                  useDarkStyling
                    ? "bg-inputBackgroundDark text-white border-cardBorder placeholder-[#87819F] focus:ring-[#5A4B7A] focus:border-[#5A4B7A]"
                    : ""
                }`}
              />
              <Button
                onClick={handleAddAdmin}
                disabled={loading || !newAdminAddress.trim()}
                size="sm"
                className={
                  useDarkStyling
                    ? "bg-buttonPrimaryDark text-white border-[#5A4B7A] hover:bg-buttonPrimaryDark/80"
                    : ""
                }
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Admin
              </Button>
            </div>

            {/* Admin list */}
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.address}
                  className={`flex items-center justify-between p-3 rounded-md ${
                    useDarkStyling
                      ? "bg-inputBackgroundDark border border-cardBorder"
                      : "bg-wash"
                  }`}
                >
                  <span
                    className={`font-mono text-sm ${
                      useDarkStyling ? "text-white" : ""
                    }`}
                  >
                    {admin.address}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveAdmin(admin.address)}
                    disabled={loading || admin.address === address}
                    className={
                      useDarkStyling ? "bg-red-500 hover:bg-red-600" : ""
                    }
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {admins.length === 0 && (
              <p
                className={`text-center py-4 ${
                  useDarkStyling ? "text-[#87819F]" : "text-tertiary"
                }`}
              >
                No forum admins configured
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Forum Permissions Section */}
      <Card
        className={`border shadow-sm ${
          useDarkStyling
            ? "bg-cardBackgroundDark border-cardBorder"
            : "bg-white border-line"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-xl font-semibold ${
                useDarkStyling ? "text-white" : "text-primary"
              }`}
            >
              Permissions
            </h2>
            <Badge variant="secondary">{permissions.length} permissions</Badge>
          </div>

          <div className="space-y-4">
            {/* Add new permission */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <Input
                placeholder="Wallet address"
                value={newPermissionAddress}
                onChange={(e) => setNewPermissionAddress(e.target.value)}
                className={
                  useDarkStyling
                    ? "bg-inputBackgroundDark text-white border-cardBorder placeholder-[#87819F] focus:ring-[#5A4B7A] focus:border-[#5A4B7A]"
                    : ""
                }
              />

              <Select
                value={newPermissionType}
                onValueChange={setNewPermissionType}
              >
                <SelectTrigger
                  className={
                    useDarkStyling
                      ? "bg-inputBackgroundDark text-white border-cardBorder focus:ring-[#5A4B7A] focus:border-[#5A4B7A]"
                      : ""
                  }
                >
                  <SelectValue placeholder="Permission type" />
                </SelectTrigger>
                <SelectContent
                  className={
                    useDarkStyling
                      ? "bg-modalBackgroundDark border-cardBorder"
                      : ""
                  }
                >
                  {PERMISSION_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className={
                        useDarkStyling
                          ? "text-white hover:bg-inputBackgroundDark"
                          : ""
                      }
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newPermissionScope}
                onValueChange={(value: "forum" | "category") => {
                  setNewPermissionScope(value);
                  if (value === "forum") {
                    setNewPermissionScopeId(null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forum">Forum-wide</SelectItem>
                  <SelectItem value="category">Category-specific</SelectItem>
                </SelectContent>
              </Select>

              {newPermissionScope === "category" && (
                <Select
                  value={newPermissionScopeId?.toString() || ""}
                  onValueChange={(value) =>
                    setNewPermissionScopeId(value ? parseInt(value) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => !c.archived)
                      .map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={handleAddPermission}
                disabled={
                  loading || !newPermissionAddress.trim() || !newPermissionType
                }
                size="sm"
                className={
                  useDarkStyling
                    ? "bg-buttonPrimaryDark text-white border-[#5A4B7A] hover:bg-buttonPrimaryDark/80"
                    : ""
                }
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Permission
              </Button>
            </div>

            {/* Permissions list */}
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className={`flex items-center justify-between p-3 rounded-md ${
                    useDarkStyling
                      ? "bg-inputBackgroundDark border border-cardBorder"
                      : "bg-wash"
                  }`}
                >
                  <div className="flex-1">
                    <div
                      className={`font-mono text-sm ${
                        useDarkStyling ? "text-white" : ""
                      }`}
                    >
                      {permission.address}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        useDarkStyling ? "text-[#87819F]" : "text-tertiary"
                      }`}
                    >
                      {PERMISSION_TYPES.find(
                        (t) => t.value === permission.permissionType
                      )?.label || permission.permissionType}
                      {" • "}
                      {permission.scope === "forum"
                        ? "Forum-wide"
                        : `Category: ${getCategoryName(permission.scopeId)}`}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemovePermission(permission.id)}
                    disabled={loading}
                    className={
                      useDarkStyling ? "bg-red-500 hover:bg-red-600" : ""
                    }
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {permissions.length === 0 && (
              <p
                className={`text-center py-4 ${
                  useDarkStyling ? "text-[#87819F]" : "text-tertiary"
                }`}
              >
                No forum permissions configured yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumPermissionsManager;
