import { getForumCategory } from "@/lib/actions/forum";
import Tenant from "@/lib/tenant/tenant";
import { UIForumConfig } from "./tenant/tenantUI";

export interface ForumAdminCheck {
  isAdmin: boolean;
  canCreateTopics: boolean;
}

export async function checkForumPermissions(
  address: string,
  categoryId: number
): Promise<ForumAdminCheck> {
  try {
    const response = await getForumCategory(categoryId);
    const category = response?.data;

    const tenant = Tenant.current();
    const forumToggle = tenant.ui.toggle("duna");
    const forumConfig = forumToggle?.config as UIForumConfig | undefined;
    const forumAdmins = forumConfig?.adminAddresses || [];
    const isAdmin = forumAdmins.includes(address as `0x${string}`);
    const canCreateTopics = !category?.adminOnlyTopics;

    return {
      isAdmin,
      canCreateTopics,
    };
  } catch (error) {
    console.error("Error checking forum permissions:", error);
    return {
      isAdmin: false,
      canCreateTopics: false,
    };
  }
}

export function canArchiveContent(
  userAddress: string,
  contentAuthor: string,
  isAdmin: boolean
): boolean {
  const isAuthor = userAddress.toLowerCase() === contentAuthor.toLowerCase();
  return isAuthor || isAdmin;
}

export function canDeleteContent(
  userAddress: string,
  contentAuthor: string,
  isAdmin: boolean
): boolean {
  const isAuthor = userAddress.toLowerCase() === contentAuthor.toLowerCase();
  return isAuthor || isAdmin;
}
