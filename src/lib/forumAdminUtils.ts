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
